import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Card, Chip, Empty, H1, H2, IconBubble, Muted, ProgressBar, Screen } from '../../components/ui';
import { findCategory, type IconName } from '../../lib/categories';
import { formatMoney, monthName, monthOf, monthSummary, parseKey, prettyDate, todayKey } from '../../lib/finance';
import { useStore, type Transaction, type TxType } from '../../lib/store';
import { colors, space } from '../../lib/theme';

const FILTERS: { value: TxType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'expense', label: 'Spent' },
  { value: 'income', label: 'Income' },
  { value: 'saving', label: 'Saved' },
  { value: 'debt', label: 'Debt' },
];

function shiftMonth(month: string, delta: number) {
  const d = parseKey(`${month}-01`);
  d.setMonth(d.getMonth() + delta);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function History() {
  const { data, deleteTransaction } = useStore();
  const cur = data.settings.currency;
  const [month, setMonth] = useState(monthOf(todayKey()));
  const [filter, setFilter] = useState<TxType | 'all'>('all');
  const summary = useMemo(() => monthSummary(data.transactions, month), [data.transactions, month]);

  const groups = useMemo(() => {
    const list = data.transactions
      .filter((t) => monthOf(t.date) === month && (filter === 'all' || t.type === filter))
      .sort((a, b) => (a.date === b.date ? b.createdAt - a.createdAt : a.date < b.date ? 1 : -1));
    const out: { date: string; items: Transaction[] }[] = [];
    for (const t of list) {
      if (out.at(-1)?.date !== t.date) out.push({ date: t.date, items: [] });
      out.at(-1)!.items.push(t);
    }
    return out;
  }, [data.transactions, month, filter]);

  const describe = (t: Transaction): { label: string; icon: IconName; color: string } => {
    if (t.type === 'saving') {
      return { label: data.goals.find((g) => g.id === t.goalId)?.name ?? 'Savings', icon: 'wallet', color: colors.saved };
    }
    if (t.type === 'debt') {
      return { label: `Paid: ${data.debts.find((d) => d.id === t.debtId)?.name ?? 'Debt'}`, icon: 'card', color: colors.debt };
    }
    const c = findCategory(t.category);
    return { label: c?.label ?? 'Other', icon: c?.icon ?? 'ellipsis-horizontal', color: t.type === 'income' ? colors.income : colors.spent };
  };

  const confirmDelete = (t: Transaction) =>
    Alert.alert('Delete entry?', `${describe(t).label} · ${formatMoney(t.amount, cur)}`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteTransaction(t.id) },
    ]);

  const isCurrent = month === monthOf(todayKey());

  return (
    <Screen>
      <H1>History</H1>
      <View style={styles.monthRow}>
        <Pressable onPress={() => setMonth(shiftMonth(month, -1))} hitSlop={12} accessibilityLabel="Previous month">
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </Pressable>
        <Text style={styles.month}>{monthName(month)}</Text>
        <Pressable onPress={() => !isCurrent && setMonth(shiftMonth(month, 1))} hitSlop={12} disabled={isCurrent} accessibilityLabel="Next month">
          <Ionicons name="chevron-forward" size={24} color={isCurrent ? colors.border : colors.primary} />
        </Pressable>
      </View>

      <Card>
        <View style={styles.sumRow}>
          <Sum label="In" value={formatMoney(summary.income, cur)} color={colors.income} />
          <Sum label="Spent" value={formatMoney(summary.spent, cur)} color={colors.spent} />
          <Sum label="Saved" value={formatMoney(summary.saved, cur)} color={colors.saved} />
          <Sum label="Debt" value={formatMoney(summary.debtPaid, cur)} color={colors.debt} />
        </View>
      </Card>

      {summary.byCategory.length > 0 && (
        <Card>
          <H2>Where the money went</H2>
          <View style={{ gap: space(3) }}>
            {summary.byCategory.map((c) => {
              const cat = findCategory(c.id);
              return (
                <View key={c.id} style={{ gap: 4 }}>
                  <View style={styles.catRow}>
                    <Ionicons name={cat?.icon ?? 'ellipsis-horizontal'} size={16} color={colors.textSecondary} />
                    <Text style={styles.catLabel}>{cat?.label ?? c.id}</Text>
                    <Text style={styles.catValue}>
                      {formatMoney(c.total, cur)} · {Math.round((c.total / summary.spent) * 100)}%
                    </Text>
                  </View>
                  <ProgressBar value={c.total / summary.byCategory[0].total} color={colors.spent} height={6} />
                </View>
              );
            })}
          </View>
        </Card>
      )}

      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <Chip key={f.value} label={f.label} selected={filter === f.value} onPress={() => setFilter(f.value)} />
        ))}
      </View>

      {groups.length === 0 ? (
        <Empty icon="receipt-outline" title="Nothing here yet" body="Entries you add will show up here, grouped by day." />
      ) : (
        groups.map((g) => (
          <View key={g.date} style={{ gap: space(2) }}>
            <Muted style={{ fontWeight: '700' }}>{prettyDate(g.date)}</Muted>
            <Card style={{ paddingVertical: space(1) }}>
              {g.items.map((t, i) => {
                const d = describe(t);
                return (
                  <Pressable key={t.id} onLongPress={() => confirmDelete(t)} style={[styles.item, i > 0 && styles.itemBorder]}>
                    <IconBubble icon={d.icon} color={d.color} size={36} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemLabel}>{d.label}</Text>
                      {t.note ? <Muted>{t.note}</Muted> : null}
                    </View>
                    <Text style={[styles.itemAmount, { color: d.color }]}>
                      {t.type === 'income' ? '+' : '−'}
                      {formatMoney(t.amount, cur)}
                    </Text>
                    <Pressable onPress={() => confirmDelete(t)} hitSlop={10} accessibilityLabel="Delete entry">
                      <Ionicons name="trash-outline" size={18} color={colors.muted} />
                    </Pressable>
                  </Pressable>
                );
              })}
            </Card>
          </View>
        ))
      )}
    </Screen>
  );
}

function Sum({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={{ fontSize: 12, color: colors.textSecondary, fontWeight: '600' }}>{label}</Text>
      <Text style={{ fontSize: 15, fontWeight: '800', color }} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  month: { fontSize: 18, fontWeight: '800', color: colors.text },
  sumRow: { flexDirection: 'row', gap: space(2) },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: space(2) },
  catLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.text },
  catValue: { fontSize: 13, color: colors.textSecondary },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: space(2) },
  item: { flexDirection: 'row', alignItems: 'center', gap: space(3), paddingVertical: space(3) },
  itemBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  itemLabel: { fontSize: 15, fontWeight: '700', color: colors.text },
  itemAmount: { fontSize: 15, fontWeight: '800' },
});
