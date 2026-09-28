import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DailyBarChart, ProgressLineChart } from '../../components/charts';
import { QuoteCard, TipCard } from '../../components/inspiration';
import { Button, Card, H1, H2, IconBubble, Muted, ProgressBar, Screen, Segmented } from '../../components/ui';
import type { IconName } from '../../lib/categories';
import {
  dailySeries,
  formatMoney,
  loggingStreak,
  monthName,
  monthOf,
  monthSummary,
  progressSeries,
  roadmap,
  safeToSpendToday,
  todayKey,
} from '../../lib/finance';
import { useStore, type TxType } from '../../lib/store';
import { colors, radius, space } from '../../lib/theme';

type Range = '7' | '14' | '30';

const QUICK: { type: TxType; label: string; icon: IconName; color: string }[] = [
  { type: 'expense', label: 'Spent', icon: 'remove-circle', color: colors.spent },
  { type: 'income', label: 'Income', icon: 'add-circle', color: colors.income },
  { type: 'saving', label: 'Save', icon: 'wallet', color: colors.saved },
  { type: 'debt', label: 'Pay debt', icon: 'card', color: colors.debt },
];

export default function Home() {
  const { data, addTransaction } = useStore();
  const { settings, transactions } = data;
  const cur = settings.currency;
  const [range, setRange] = useState<Range>('7');

  const today = todayKey();
  const month = monthOf(today);
  const summary = useMemo(() => monthSummary(transactions, month), [transactions, month]);
  const safe = useMemo(() => safeToSpendToday(data), [data]);
  const daily = useMemo(() => dailySeries(transactions, Number(range)), [transactions, range]);
  const progress = useMemo(() => progressSeries(transactions, 30), [transactions]);
  const streak = useMemo(() => loggingStreak(transactions), [transactions]);
  const steps = useMemo(() => roadmap(data), [data]);
  const nextStep = steps.find((s) => !s.done);
  const stepNo = nextStep ? steps.indexOf(nextStep) + 1 : steps.length;

  const salaryLogged = transactions.some((t) => t.type === 'income' && t.category === 'salary' && monthOf(t.date) === month);
  const income = Math.max(summary.income, settings.monthlySalary);
  const savingsRate = income > 0 ? (summary.saved + summary.debtPaid) / income : 0;

  return (
    <Screen>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Muted>{greeting()}</Muted>
          <H1>{settings.name ? `Hi, ${settings.name} 👋` : 'Hi there 👋'}</H1>
        </View>
        {streak > 0 && (
          <View style={styles.streak} accessibilityLabel={`${streak} day logging streak`}>
            <Ionicons name="flame" size={16} color={colors.spent} />
            <Text style={styles.streakText}>{streak}</Text>
          </View>
        )}
        <Pressable onPress={() => router.push('/settings')} accessibilityLabel="Settings" hitSlop={10}>
          <Ionicons name="settings-outline" size={24} color={colors.textSecondary} />
        </Pressable>
      </View>

      <QuoteCard />

      <Card style={{ backgroundColor: colors.primary }}>
        <Text style={styles.heroLabel}>Safe to spend today</Text>
        <Text style={styles.heroValue}>{formatMoney(safe.perDay, cur)}</Text>
        <Text style={styles.heroSub}>
          {safe.left >= 0
            ? `${formatMoney(safe.left, cur)} left for the next ${safe.daysLeft} day${safe.daysLeft === 1 ? '' : 's'}`
            : `You're ${formatMoney(-safe.left, cur)} over this month — slow down a little 💪`}
        </Text>
      </Card>

      <View style={styles.quickRow}>
        {QUICK.map((q) => (
          <Pressable
            key={q.type}
            style={styles.quick}
            onPress={() => router.push({ pathname: '/add', params: { type: q.type } })}
            accessibilityRole="button"
            accessibilityLabel={`Add ${q.label}`}
          >
            <IconBubble icon={q.icon} color={q.color} size={44} />
            <Text style={styles.quickText}>{q.label}</Text>
          </Pressable>
        ))}
      </View>

      {!salaryLogged && settings.monthlySalary > 0 && (
        <Card style={{ backgroundColor: colors.goldSoft }}>
          <H2>Payday? 💰</H2>
          <Muted>Log your {formatMoney(settings.monthlySalary, cur)} salary for {monthName(month)} in one tap.</Muted>
          <View style={{ marginTop: space(3) }}>
            <Button
              title="Log salary"
              icon="briefcase"
              onPress={() => addTransaction({ type: 'income', amount: settings.monthlySalary, category: 'salary', date: today })}
            />
          </View>
        </Card>
      )}

      <Card>
        <H2>{monthName(month)}</H2>
        <View style={styles.tiles}>
          <Tile label="Income" value={formatMoney(summary.income, cur)} color={colors.income} />
          <Tile label="Spent" value={formatMoney(summary.spent, cur)} color={colors.spent} />
          <Tile label="Saved" value={formatMoney(summary.saved, cur)} color={colors.saved} />
          <Tile label="Debt paid" value={formatMoney(summary.debtPaid, cur)} color={colors.debt} />
        </View>
        {income > 0 && (
          <View style={{ gap: space(3), marginTop: space(4) }}>
            <Muted>50/30/20 check (of {formatMoney(income, cur)})</Muted>
            <BucketBar label="Needs" value={summary.needs} target={income * 0.5} currency={cur} color={colors.income} overIsBad />
            <BucketBar label="Wants" value={summary.wants} target={income * 0.3} currency={cur} color={colors.spent} overIsBad />
            <BucketBar label="Savings + debt" value={summary.saved + summary.debtPaid} target={income * 0.2} currency={cur} color={colors.saved} />
            <Muted>
              You're putting {Math.round(savingsRate * 100)}% of your income to work.{' '}
              {savingsRate >= 0.2 ? 'Amazing! 🚀' : 'Every extra bit counts 🌱'}
            </Muted>
          </View>
        )}
      </Card>

      <Card>
        <H2>Daily tracker</H2>
        <View style={{ marginBottom: space(3) }}>
          <Segmented
            value={range}
            onChange={setRange}
            options={[
              { value: '7', label: '7 days' },
              { value: '14', label: '14 days' },
              { value: '30', label: '30 days' },
            ]}
          />
        </View>
        <DailyBarChart key={range} data={daily} currency={cur} />
      </Card>

      <Card>
        <H2>Your progress (30 days)</H2>
        <ProgressLineChart data={progress} currency={cur} />
        <Muted style={{ marginTop: space(2) }}>Everything you've saved plus every debt payment. Keep this line climbing!</Muted>
      </Card>

      {nextStep && (
        <Pressable onPress={() => router.push('/goals')} accessibilityRole="button">
          <Card>
            <H2 right={<Text style={styles.stepBadge}>Step {stepNo} of {steps.length}</Text>}>Your next money step</H2>
            <Text style={styles.stepTitle}>{nextStep.title}</Text>
            <Muted>{nextStep.detail}</Muted>
            <View style={{ marginTop: space(3) }}>
              <ProgressBar value={(stepNo - 1) / steps.length} color={colors.primary} />
            </View>
          </Card>
        </Pressable>
      )}

      <TipCard />
    </Screen>
  );
}

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

function Tile({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.tile}>
      <View style={[styles.tileDot, { backgroundColor: color }]} />
      <Text style={styles.tileLabel}>{label}</Text>
      <Text style={styles.tileValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}

function BucketBar({
  label,
  value,
  target,
  currency,
  color,
  overIsBad,
}: {
  label: string;
  value: number;
  target: number;
  currency: string;
  color: string;
  overIsBad?: boolean;
}) {
  const over = overIsBad && value > target;
  return (
    <View style={{ gap: 4 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.bucketLabel}>{label}</Text>
        <Text style={[styles.bucketValue, over && { color: colors.danger }]}>
          {formatMoney(value, currency)} / {formatMoney(target, currency)}
          {over ? '  ⚠️ over' : ''}
        </Text>
      </View>
      <ProgressBar value={target > 0 ? value / target : 0} color={over ? colors.danger : color} height={8} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: space(3) },
  streak: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fdeee6', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  streakText: { fontWeight: '800', color: colors.spent },
  heroLabel: { color: '#dfe6ff', fontSize: 14, fontWeight: '600' },
  heroValue: { color: '#fff', fontSize: 38, fontWeight: '800', marginVertical: 4 },
  heroSub: { color: '#dfe6ff', fontSize: 14 },
  quickRow: { flexDirection: 'row', justifyContent: 'space-between' },
  quick: { alignItems: 'center', gap: 6, flex: 1, backgroundColor: colors.card, marginHorizontal: 4, paddingVertical: space(3), borderRadius: radius.md },
  quickText: { fontSize: 13, fontWeight: '700', color: colors.text },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: space(2) },
  tile: { width: '48%', flexGrow: 1, backgroundColor: colors.bg, borderRadius: radius.md, padding: space(3) },
  tileDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 6 },
  tileLabel: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  tileValue: { fontSize: 20, color: colors.text, fontWeight: '800', marginTop: 2 },
  bucketLabel: { fontSize: 14, fontWeight: '700', color: colors.text },
  bucketValue: { fontSize: 13, color: colors.textSecondary },
  stepBadge: { fontSize: 12, fontWeight: '700', color: colors.primary, backgroundColor: colors.primarySoft, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, overflow: 'hidden' },
  stepTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 4 },
});
