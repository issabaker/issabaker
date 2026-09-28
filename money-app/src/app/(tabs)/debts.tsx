import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Empty, Field, H1, H2, IconBubble, Muted, ProgressBar, Screen, Segmented } from '../../components/ui';
import { DEBT_KINDS } from '../../lib/categories';
import { debtBalance, formatMoney, monthsFromNow, parseAmount, payoffPlan } from '../../lib/finance';
import { useStore, type Strategy } from '../../lib/store';
import { colors, space } from '../../lib/theme';

export default function Debts() {
  const { data, updateSettings } = useStore();
  const { settings, debts, transactions } = data;
  const cur = settings.currency;
  const [budgetText, setBudgetText] = useState(settings.debtBudget ? String(settings.debtBudget) : '');
  useEffect(() => setBudgetText(settings.debtBudget ? String(settings.debtBudget) : ''), [settings.debtBudget]);

  const rows = useMemo(
    () => debts.map((d) => ({ debt: d, balance: debtBalance(d, transactions) })),
    [debts, transactions],
  );
  const totalStart = rows.reduce((s, r) => s + r.debt.startBalance, 0);
  const totalLeft = rows.reduce((s, r) => s + r.balance, 0);
  const plan = useMemo(
    () => payoffPlan(debts, transactions, settings.debtBudget, settings.strategy),
    [debts, transactions, settings.debtBudget, settings.strategy],
  );
  const focusId = plan.order[0]?.id;
  const planById = new Map(plan.order.map((o) => [o.id, o]));
  // Show debts in payoff order (focus first), paid-off ones at the bottom
  const rank = (id: string) => {
    const i = plan.order.findIndex((o) => o.id === id);
    return i === -1 ? Infinity : i;
  };
  const sortedRows = [...rows].sort((a, b) => rank(a.debt.id) - rank(b.debt.id));

  return (
    <Screen>
      <H1>Debt freedom</H1>

      {debts.length === 0 ? (
        <Card>
          <Empty
            icon="card"
            title="Add your debts"
            body="Add each credit card, your car loan and any other loans. We'll build a plan to pay them off and close them for good."
          />
          <Button title="Add a debt" icon="add" onPress={() => router.push('/debt-edit')} />
        </Card>
      ) : (
        <>
          <Card style={{ backgroundColor: colors.debt }}>
            <Text style={styles.heroLabel}>Total debt left</Text>
            <Text style={styles.heroValue}>{formatMoney(totalLeft, cur)}</Text>
            <View style={{ marginVertical: space(2) }}>
              <ProgressBar value={totalStart ? 1 - totalLeft / totalStart : 0} color="#fff" />
            </View>
            <Text style={styles.heroSub}>
              {totalLeft === 0
                ? '🎉 You are DEBT FREE! Incredible work.'
                : `${formatMoney(totalStart - totalLeft, cur)} paid off so far — ${Math.round((1 - totalLeft / totalStart) * 100)}% done`}
            </Text>
          </Card>

          {totalLeft > 0 && (
            <Card>
              <H2>Your payoff plan</H2>
              <Segmented<Strategy>
                value={settings.strategy}
                onChange={(strategy) => updateSettings({ strategy })}
                options={[
                  { value: 'avalanche', label: '🏔 Avalanche' },
                  { value: 'snowball', label: '⛄ Snowball' },
                ]}
              />
              <Muted style={{ marginVertical: space(2) }}>
                {settings.strategy === 'avalanche'
                  ? 'Highest interest rate first — saves the most money.'
                  : 'Smallest balance first — quick wins keep you motivated.'}
              </Muted>
              <Field
                label={`Monthly amount for debts (minimums total ${formatMoney(plan.minimumsTotal, cur)})`}
                value={budgetText}
                onChangeText={setBudgetText}
                onEndEditing={() => updateSettings({ debtBudget: parseAmount(budgetText) })}
                keyboardType="decimal-pad"
                placeholder={String(Math.ceil(plan.minimumsTotal))}
              />
              {plan.feasible ? (
                <View style={styles.planBox}>
                  <Text style={styles.planBig}>Debt-free by {monthsFromNow(plan.months)}</Text>
                  <Muted>
                    {plan.months} month{plan.months === 1 ? '' : 's'} · about {formatMoney(plan.totalInterest, cur)} in interest
                  </Muted>
                  {settings.debtBudget <= plan.minimumsTotal && (
                    <Muted style={{ marginTop: space(2), color: colors.warning }}>
                      Tip: paying even a little more than the minimums shortens this a lot. Try adding an amount above.
                    </Muted>
                  )}
                </View>
              ) : (
                <Muted style={{ color: colors.danger }}>
                  At this amount the interest grows faster than your payments. Increase the monthly amount to see your debt-free date.
                </Muted>
              )}
            </Card>
          )}

          <H2 right={<Button title="Add" icon="add" variant="soft" onPress={() => router.push('/debt-edit')} />}>Your debts</H2>
          {sortedRows.map(({ debt, balance }) => {
            const kind = DEBT_KINDS.find((k) => k.value === debt.kind) ?? DEBT_KINDS[4];
            const paidOff = balance === 0;
            const p = planById.get(debt.id);
            return (
              <Pressable key={debt.id} onPress={() => router.push({ pathname: '/debt-edit', params: { id: debt.id } })}>
                <Card style={paidOff ? { borderWidth: 2, borderColor: colors.saved } : undefined}>
                  <View style={styles.row}>
                    <IconBubble icon={kind.icon} color={paidOff ? colors.saved : colors.debt} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.name}>{debt.name}</Text>
                      <Muted>
                        {kind.label} · {debt.apr}% APR · min {formatMoney(debt.minPayment, cur)}
                      </Muted>
                    </View>
                    {debt.id === focusId && <Text style={styles.focus}>FOCUS</Text>}
                  </View>
                  <View style={{ marginVertical: space(3) }}>
                    <ProgressBar value={debt.startBalance ? 1 - balance / debt.startBalance : 1} color={paidOff ? colors.saved : colors.debt} />
                  </View>
                  {paidOff ? (
                    <Text style={styles.paidOff}>
                      🎉 Paid off!{debt.kind === 'credit_card' ? ' Time to close this card (or cut it up and never use it).' : ' One less bill every month.'}
                    </Text>
                  ) : (
                    <View style={styles.row}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.balance}>{formatMoney(balance, cur)} left</Text>
                        {p && p.monthsToPayoff > 0 && <Muted>Gone by {monthsFromNow(p.monthsToPayoff)}</Muted>}
                      </View>
                      <Button
                        title="Pay"
                        icon="checkmark-circle"
                        onPress={() => router.push({ pathname: '/add', params: { type: 'debt', debtId: debt.id } })}
                      />
                    </View>
                  )}
                </Card>
              </Pressable>
            );
          })}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroLabel: { color: '#ece4fb', fontSize: 14, fontWeight: '600' },
  heroValue: { color: '#fff', fontSize: 34, fontWeight: '800', marginTop: 4 },
  heroSub: { color: '#ece4fb', fontSize: 14 },
  planBox: { backgroundColor: colors.bg, borderRadius: 12, padding: space(3) },
  planBig: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space(3) },
  name: { fontSize: 16, fontWeight: '800', color: colors.text },
  focus: { fontSize: 11, fontWeight: '800', color: '#fff', backgroundColor: colors.debt, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, overflow: 'hidden' },
  balance: { fontSize: 18, fontWeight: '800', color: colors.text },
  paidOff: { fontSize: 15, fontWeight: '700', color: colors.good },
});
