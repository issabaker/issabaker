import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, Chip, Empty, Field, Segmented } from '../components/ui';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../lib/categories';
import { addDays, debtBalance, formatMoney, goalSaved, parseAmount, prettyDate, todayKey } from '../lib/finance';
import { useStore, type TxType } from '../lib/store';
import { colors, radius, space } from '../lib/theme';

const TYPES: { value: TxType; label: string }[] = [
  { value: 'expense', label: 'Spent' },
  { value: 'income', label: 'Income' },
  { value: 'saving', label: 'Save' },
  { value: 'debt', label: 'Debt' },
];

const TYPE_COLOR: Record<TxType, string> = {
  expense: colors.spent,
  income: colors.income,
  saving: colors.saved,
  debt: colors.debt,
};

export default function AddEntry() {
  const params = useLocalSearchParams<{ type?: TxType; goalId?: string; debtId?: string }>();
  const { data, addTransaction } = useStore();
  const cur = data.settings.currency;

  const [type, setType] = useState<TxType>(params.type && TYPES.some((t) => t.value === params.type) ? params.type : 'expense');
  const [amountText, setAmountText] = useState('');
  const [category, setCategory] = useState<string>(type === 'income' ? 'salary' : 'groceries');
  const openDebts = useMemo(() => data.debts.filter((d) => debtBalance(d, data.transactions) > 0), [data]);
  const [pickedGoal, setGoalId] = useState(params.goalId);
  const [pickedDebt, setDebtId] = useState(params.debtId);
  // Fall back to the newest goal / first open debt (e.g. right after creating one from here)
  const goalId = data.goals.some((g) => g.id === pickedGoal) ? pickedGoal : data.goals[data.goals.length - 1]?.id;
  const debtId = openDebts.some((d) => d.id === pickedDebt) ? pickedDebt : openDebts[0]?.id;
  const [date, setDate] = useState(todayKey());
  const [note, setNote] = useState('');

  const amount = parseAmount(amountText);
  const cats = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const canSave =
    amount > 0 &&
    (type === 'saving' ? !!goalId : type === 'debt' ? !!debtId : cats.some((c) => c.id === category));

  const changeType = (t: TxType) => {
    setType(t);
    if (t === 'income') setCategory('salary');
    if (t === 'expense') setCategory('groceries');
  };

  const save = () => {
    if (!canSave) return;
    addTransaction({
      type,
      amount,
      category: type === 'saving' || type === 'debt' ? type : category,
      note: note.trim() || undefined,
      date,
      goalId: type === 'saving' ? goalId : undefined,
      debtId: type === 'debt' ? debtId : undefined,
    });
    router.back();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Segmented options={TYPES} value={type} onChange={changeType} />

        <View style={styles.amountBox}>
          <Text style={[styles.currency, { color: TYPE_COLOR[type] }]}>{cur}</Text>
          <TextInput
            value={amountText}
            onChangeText={setAmountText}
            placeholder="0"
            placeholderTextColor={colors.muted}
            keyboardType="decimal-pad"
            autoFocus
            style={[styles.amount, { color: TYPE_COLOR[type] }]}
            accessibilityLabel="Amount"
          />
        </View>

        {(type === 'expense' || type === 'income') && (
          <View style={styles.grid}>
            {cats.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => setCategory(c.id)}
                style={[styles.cat, category === c.id && { borderColor: TYPE_COLOR[type], backgroundColor: `${TYPE_COLOR[type]}14` }]}
                accessibilityRole="button"
                accessibilityState={{ selected: category === c.id }}
              >
                <Ionicons name={c.icon} size={22} color={category === c.id ? TYPE_COLOR[type] : colors.textSecondary} />
                <Text style={styles.catText} numberOfLines={2}>
                  {c.label}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {type === 'saving' &&
          (data.goals.length === 0 ? (
            <Empty icon="flag" title="No savings goals yet" body="Create a goal like Emergency fund, House or Investing first." />
          ) : (
            <View style={styles.list}>
              {data.goals.map((g) => (
                <Pressable key={g.id} onPress={() => setGoalId(g.id)} style={[styles.pick, goalId === g.id && { borderColor: colors.saved }]}>
                  <Ionicons name={goalId === g.id ? 'radio-button-on' : 'radio-button-off'} size={20} color={colors.saved} />
                  <Text style={styles.pickText}>{g.name}</Text>
                  <Text style={styles.pickSub}>
                    {formatMoney(goalSaved(g, data.transactions), cur)} / {formatMoney(g.target, cur)}
                  </Text>
                </Pressable>
              ))}
            </View>
          ))}
        {type === 'saving' && (
          <Button title="New goal" icon="add" variant="soft" onPress={() => router.push('/goal-edit')} />
        )}

        {type === 'debt' &&
          (openDebts.length === 0 ? (
            <Empty icon="card" title="No open debts" body="Add your credit cards and car loan in the Debts tab to track payoff." />
          ) : (
            <View style={styles.list}>
              {openDebts.map((d) => (
                <Pressable key={d.id} onPress={() => setDebtId(d.id)} style={[styles.pick, debtId === d.id && { borderColor: colors.debt }]}>
                  <Ionicons name={debtId === d.id ? 'radio-button-on' : 'radio-button-off'} size={20} color={colors.debt} />
                  <Text style={styles.pickText}>{d.name}</Text>
                  <Text style={styles.pickSub}>{formatMoney(debtBalance(d, data.transactions), cur)} left</Text>
                </Pressable>
              ))}
            </View>
          ))}
        {type === 'debt' && openDebts.length === 0 && (
          <Button title="Add a debt" icon="add" variant="soft" onPress={() => router.push('/debt-edit')} />
        )}

        <View style={styles.dateRow}>
          <Pressable onPress={() => setDate(addDays(date, -1))} hitSlop={10} accessibilityLabel="Previous day">
            <Ionicons name="chevron-back" size={22} color={colors.primary} />
          </Pressable>
          <Text style={styles.dateText}>{prettyDate(date)}</Text>
          <Pressable
            onPress={() => date < todayKey() && setDate(addDays(date, 1))}
            hitSlop={10}
            accessibilityLabel="Next day"
            disabled={date >= todayKey()}
          >
            <Ionicons name="chevron-forward" size={22} color={date >= todayKey() ? colors.border : colors.primary} />
          </Pressable>
        </View>
        <View style={{ flexDirection: 'row', gap: space(2) }}>
          <Chip label="Today" selected={date === todayKey()} onPress={() => setDate(todayKey())} />
          <Chip label="Yesterday" selected={date === addDays(todayKey(), -1)} onPress={() => setDate(addDays(todayKey(), -1))} />
        </View>

        <Field label="Note (optional)" value={note} onChangeText={setNote} placeholder="e.g. lunch with team" />

        <Button title="Save" icon="checkmark" onPress={save} disabled={!canSave} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: space(4), gap: space(4), paddingBottom: space(12) },
  amountBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space(2), paddingVertical: space(2) },
  currency: { fontSize: 28, fontWeight: '700' },
  amount: { fontSize: 48, fontWeight: '800', minWidth: 120, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space(2) },
  cat: {
    width: '23%',
    flexGrow: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: space(3),
    paddingHorizontal: 4,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  catText: { fontSize: 11, fontWeight: '600', color: colors.text, textAlign: 'center' },
  list: { gap: space(2) },
  pick: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space(3),
    padding: space(3),
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  pickText: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.text },
  pickSub: { fontSize: 13, color: colors.textSecondary },
  dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.card, borderRadius: radius.md, padding: space(3) },
  dateText: { fontSize: 16, fontWeight: '700', color: colors.text },
});
