import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Chip, H1, H2, IconBubble, Muted, ProgressBar, Screen } from '../../components/ui';
import { GOAL_KINDS } from '../../lib/categories';
import { formatMoney, goalSaved, monthOf, roadmap, todayKey } from '../../lib/finance';
import { useStore, type GoalKind } from '../../lib/store';
import { colors, space } from '../../lib/theme';

const SUGGESTED: { kind: GoalKind; name: string; months: number }[] = [
  { kind: 'emergency', name: 'Emergency fund', months: 3 },
  { kind: 'house', name: 'House down payment', months: 12 },
  { kind: 'invest', name: 'Investing', months: 6 },
  { kind: 'retirement', name: 'Retirement', months: 12 },
];

export default function Goals() {
  const { data, saveGoal } = useStore();
  const { goals, transactions, settings } = data;
  const cur = settings.currency;
  const steps = useMemo(() => roadmap(data), [data]);
  const current = steps.findIndex((s) => !s.done);
  const month = monthOf(todayKey());
  const missing = SUGGESTED.filter((s) => !goals.some((g) => g.kind === s.kind));

  return (
    <Screen>
      <H1>Goals & future</H1>

      <Card>
        <H2>Your money roadmap</H2>
        <Muted style={{ marginBottom: space(3) }}>A proven order of steps. Focus on one at a time — we tick them off from your data.</Muted>
        {steps.map((s, i) => (
          <View key={s.title} style={styles.step}>
            <Ionicons
              name={s.done ? 'checkmark-circle' : i === current ? 'arrow-forward-circle' : 'ellipse-outline'}
              size={24}
              color={s.done ? colors.saved : i === current ? colors.primary : colors.muted}
            />
            <View style={{ flex: 1 }}>
              <Text style={[styles.stepTitle, s.done && styles.stepDone, i === current && { color: colors.primary }]}>
                {i + 1}. {s.title}
              </Text>
              {i === current && <Muted>{s.detail}</Muted>}
            </View>
          </View>
        ))}
      </Card>

      <H2 right={<Button title="New goal" icon="add" variant="soft" onPress={() => router.push('/goal-edit')} />}>Savings goals</H2>

      {goals.map((g) => {
        const kind = GOAL_KINDS.find((k) => k.value === g.kind) ?? GOAL_KINDS[5];
        const saved = goalSaved(g, transactions);
        const pct = g.target > 0 ? saved / g.target : 0;
        const thisMonth = transactions
          .filter((t) => t.type === 'saving' && t.goalId === g.id && monthOf(t.date) === month)
          .reduce((s, t) => s + t.amount, 0);
        return (
          <Pressable key={g.id} onPress={() => router.push({ pathname: '/goal-edit', params: { id: g.id } })}>
            <Card>
              <View style={styles.row}>
                <IconBubble icon={kind.icon} color={kind.color} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{g.name}</Text>
                  <Muted>
                    {formatMoney(saved, cur)} of {formatMoney(g.target, cur)}
                    {thisMonth > 0 ? ` · +${formatMoney(thisMonth, cur)} this month` : ''}
                  </Muted>
                </View>
                <Text style={[styles.pct, { color: kind.color }]}>{Math.min(100, Math.round(pct * 100))}%</Text>
              </View>
              <View style={{ marginVertical: space(3) }}>
                <ProgressBar value={pct} color={kind.color} />
              </View>
              {pct >= 1 ? (
                <Text style={styles.done}>🏆 Goal reached! Amazing discipline.</Text>
              ) : (
                <Button
                  title="Add money"
                  icon="add-circle"
                  variant="soft"
                  onPress={() => router.push({ pathname: '/add', params: { type: 'saving', goalId: g.id } })}
                />
              )}
            </Card>
          </Pressable>
        );
      })}

      {missing.length > 0 && (
        <Card>
          <H2>Quick start</H2>
          <Muted style={{ marginBottom: space(3) }}>Tap to create a goal with a suggested target based on your salary. You can edit it anytime.</Muted>
          <View style={styles.chips}>
            {missing.map((s) => (
              <Chip
                key={s.kind}
                label={s.name}
                icon={GOAL_KINDS.find((k) => k.value === s.kind)?.icon}
                selected={false}
                onPress={() =>
                  saveGoal({ name: s.name, kind: s.kind, target: (settings.monthlySalary || 1000) * s.months, startAmount: 0 })
                }
              />
            ))}
          </View>
        </Card>
      )}

      <Card style={{ backgroundColor: colors.primarySoft }}>
        <H2>📈 Investing basics</H2>
        <Muted>
          • Clear high-interest debt and build your emergency fund first.{'\n'}
          • Take any employer retirement match — it's free money.{'\n'}
          • Low-cost, diversified index funds are a simple long-term choice.{'\n'}
          • Invest a fixed amount every month and don't panic in dips.{'\n'}
          • Money for a house in the next 1–3 years belongs in savings, not stocks.
        </Muted>
        <Muted style={{ marginTop: space(3), fontSize: 12 }}>
          General education, not personal financial advice. Consider a licensed, fee-only advisor for your situation.
        </Muted>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  step: { flexDirection: 'row', gap: space(3), paddingVertical: space(2), alignItems: 'flex-start' },
  stepTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: 2 },
  stepDone: { color: colors.muted, textDecorationLine: 'line-through' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space(3) },
  name: { fontSize: 16, fontWeight: '800', color: colors.text },
  pct: { fontSize: 18, fontWeight: '800' },
  done: { fontSize: 15, fontWeight: '700', color: colors.good },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space(2) },
});
