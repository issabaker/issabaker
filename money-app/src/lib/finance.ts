import { findCategory } from './categories';
import type { AppData, Debt, Goal, Strategy, Transaction } from './store';

// ---------- dates (always local time, stored as YYYY-MM-DD) ----------

const pad = (n: number) => String(n).padStart(2, '0');

export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayKey(): string {
  return dateKey(new Date());
}

export function parseKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: string, days: number): string {
  const d = parseKey(key);
  d.setDate(d.getDate() + days);
  return dateKey(d);
}

export function monthOf(key: string): string {
  return key.slice(0, 7);
}

export function daysInMonth(key: string): number {
  const d = parseKey(key);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function prettyDate(key: string): string {
  const today = todayKey();
  if (key === today) return 'Today';
  if (key === addDays(today, -1)) return 'Yesterday';
  const d = parseKey(key);
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function monthName(key: string): string {
  const d = parseKey(key.length === 7 ? `${key}-01` : key);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function shortDate(key: string): string {
  const d = parseKey(key);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function dayOfYear(d = new Date()): number {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 86_400_000);
}

// ---------- money ----------

export function formatMoney(amount: number, currency: string, decimals?: number): string {
  const digits = decimals ?? (Math.abs(amount) >= 1000 || Number.isInteger(amount) ? 0 : 2);
  const sign = amount < 0 ? '-' : '';
  const [whole, frac] = Math.abs(amount).toFixed(digits).split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${sign}${currency}${currency.length > 1 ? ' ' : ''}${grouped}${frac ? `.${frac}` : ''}`;
}

export function parseAmount(text: string): number {
  const n = Number(text.replace(/,/g, '').trim());
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : 0;
}

// ---------- balances ----------

export function debtBalance(debt: Debt, txs: Transaction[]): number {
  const paid = txs.reduce((s, t) => (t.type === 'debt' && t.debtId === debt.id ? s + t.amount : s), 0);
  return Math.max(0, Math.round((debt.startBalance - paid) * 100) / 100);
}

export function goalSaved(goal: Goal, txs: Transaction[]): number {
  return txs.reduce((s, t) => (t.type === 'saving' && t.goalId === goal.id ? s + t.amount : s), goal.startAmount);
}

export interface MonthSummary {
  income: number;
  spent: number;
  saved: number;
  debtPaid: number;
  needs: number;
  wants: number;
  byCategory: { id: string; total: number }[];
}

export function monthSummary(txs: Transaction[], month: string): MonthSummary {
  const s: MonthSummary = { income: 0, spent: 0, saved: 0, debtPaid: 0, needs: 0, wants: 0, byCategory: [] };
  const cats = new Map<string, number>();
  for (const t of txs) {
    if (monthOf(t.date) !== month) continue;
    if (t.type === 'income') s.income += t.amount;
    else if (t.type === 'saving') s.saved += t.amount;
    else if (t.type === 'debt') s.debtPaid += t.amount;
    else {
      s.spent += t.amount;
      if (findCategory(t.category)?.bucket === 'needs') s.needs += t.amount;
      else s.wants += t.amount;
      cats.set(t.category, (cats.get(t.category) ?? 0) + t.amount);
    }
  }
  s.byCategory = [...cats.entries()].map(([id, total]) => ({ id, total })).sort((a, b) => b.total - a.total);
  return s;
}

export interface DayPoint {
  date: string;
  spent: number;
  /** Money put to work: savings + debt payments */
  saved: number;
}

export function dailySeries(txs: Transaction[], days: number, end = todayKey()): DayPoint[] {
  const start = addDays(end, -(days - 1));
  const map = new Map<string, DayPoint>();
  for (let i = 0; i < days; i++) {
    const date = addDays(start, i);
    map.set(date, { date, spent: 0, saved: 0 });
  }
  for (const t of txs) {
    const p = map.get(t.date);
    if (!p) continue;
    if (t.type === 'expense') p.spent += t.amount;
    else if (t.type === 'saving' || t.type === 'debt') p.saved += t.amount;
  }
  return [...map.values()];
}

/** Running total of everything saved + debt paid off, one point per day. */
export function progressSeries(txs: Transaction[], days: number, end = todayKey()): { date: string; value: number }[] {
  const start = addDays(end, -(days - 1));
  let running = 0;
  const perDay = new Map<string, number>();
  for (const t of txs) {
    if (t.type !== 'saving' && t.type !== 'debt') continue;
    if (t.date < start) running += t.amount;
    else if (t.date <= end) perDay.set(t.date, (perDay.get(t.date) ?? 0) + t.amount);
  }
  const out: { date: string; value: number }[] = [];
  for (let i = 0; i < days; i++) {
    const date = addDays(start, i);
    running += perDay.get(date) ?? 0;
    out.push({ date, value: running });
  }
  return out;
}

/** Consecutive days (ending today, or yesterday if nothing logged yet today) with at least one entry. */
export function loggingStreak(txs: Transaction[]): number {
  const days = new Set(txs.map((t) => t.date));
  let day = todayKey();
  if (!days.has(day)) day = addDays(day, -1);
  let streak = 0;
  while (days.has(day)) {
    streak++;
    day = addDays(day, -1);
  }
  return streak;
}

/** How much can be spent per day for the rest of the month without going negative. */
export function safeToSpendToday(data: AppData): { perDay: number; left: number; daysLeft: number } {
  const today = todayKey();
  const s = monthSummary(data.transactions, monthOf(today));
  const income = Math.max(s.income, data.settings.monthlySalary);
  const left = income - s.spent - s.saved - s.debtPaid;
  const daysLeft = daysInMonth(today) - parseKey(today).getDate() + 1;
  return { perDay: Math.max(0, left / daysLeft), left, daysLeft };
}

// ---------- debt payoff plan ----------

export interface PayoffEntry {
  id: string;
  name: string;
  balance: number;
  monthsToPayoff: number;
}

export interface PayoffPlan {
  feasible: boolean;
  months: number;
  totalInterest: number;
  minimumsTotal: number;
  order: PayoffEntry[];
}

export function orderDebts<T extends { apr: number; balance: number }>(debts: T[], strategy: Strategy): T[] {
  return [...debts].sort((a, b) =>
    strategy === 'avalanche' ? b.apr - a.apr || a.balance - b.balance : a.balance - b.balance || b.apr - a.apr,
  );
}

/**
 * Simulates paying a fixed monthly budget toward all debts: every debt gets its
 * minimum, the rest goes to the focus debt. When a debt is paid off, its minimum
 * rolls into the next one (the "snowball" effect works for both strategies).
 */
export function payoffPlan(debts: Debt[], txs: Transaction[], monthlyBudget: number, strategy: Strategy): PayoffPlan {
  const live = orderDebts(
    debts
      .map((d) => ({ id: d.id, name: d.name, apr: d.apr, min: d.minPayment, balance: debtBalance(d, txs) }))
      .filter((d) => d.balance > 0),
    strategy,
  );
  const minimumsTotal = live.reduce((s, d) => s + Math.min(d.min, d.balance), 0);
  const budget = Math.max(monthlyBudget, minimumsTotal);
  const order: PayoffEntry[] = live.map((d) => ({ id: d.id, name: d.name, balance: d.balance, monthsToPayoff: 0 }));
  if (live.length === 0) return { feasible: true, months: 0, totalInterest: 0, minimumsTotal, order };

  let totalInterest = 0;
  let month = 0;
  while (live.some((d) => d.balance > 0.005) && month < 600) {
    month++;
    for (const d of live) {
      if (d.balance <= 0) continue;
      const interest = (d.balance * d.apr) / 1200;
      d.balance += interest;
      totalInterest += interest;
    }
    let money = budget;
    for (const d of live) {
      if (d.balance <= 0) continue;
      const pay = Math.min(d.min, d.balance, money);
      d.balance -= pay;
      money -= pay;
    }
    for (const d of live) {
      if (money <= 0) break;
      if (d.balance <= 0) continue;
      const pay = Math.min(d.balance, money);
      d.balance -= pay;
      money -= pay;
    }
    live.forEach((d, i) => {
      if (d.balance <= 0.005 && order[i].monthsToPayoff === 0) {
        d.balance = 0;
        order[i].monthsToPayoff = month;
      }
    });
  }
  const feasible = live.every((d) => d.balance <= 0.005);
  return { feasible, months: month, totalInterest: Math.round(totalInterest), minimumsTotal, order };
}

export function monthsFromNow(months: number): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

// ---------- roadmap ----------

export interface RoadmapStep {
  title: string;
  detail: string;
  done: boolean;
}

/**
 * A classic, widely-taught order of operations for personal finance.
 * Each step is checked against the user's own data.
 */
export function roadmap(data: AppData): RoadmapStep[] {
  const { transactions: txs, debts, goals, settings } = data;
  const salary = settings.monthlySalary;
  const emergency = goals.filter((g) => g.kind === 'emergency');
  const emergencySaved = emergency.reduce((s, g) => s + goalSaved(g, txs), 0);
  // Starter fund: one month of salary (or 1,000 if salary isn't set yet)
  const starter = salary > 0 ? salary : 1000;
  const fullEmergency = emergency.reduce((s, g) => s + g.target, 0) || salary * 3 || 3000;
  const highInterest = debts.filter((d) => d.kind === 'credit_card' || d.apr >= 8);
  const otherDebt = debts.filter((d) => !highInterest.includes(d));
  const cleared = (list: Debt[]) => list.every((d) => debtBalance(d, txs) === 0);
  const investGoals = goals.filter((g) => g.kind === 'invest' || g.kind === 'retirement');
  const thisMonth = monthOf(todayKey());
  const investingThisMonth = txs.some(
    (t) => t.type === 'saving' && monthOf(t.date) === thisMonth && investGoals.some((g) => g.id === t.goalId),
  );
  const house = goals.filter((g) => g.kind === 'house');
  const houseProgress = house.length > 0 && house.every((g) => goalSaved(g, txs) >= g.target);

  return [
    {
      title: 'Know where your money goes',
      detail: 'Log your salary and daily spending for this month.',
      done: txs.some((t) => monthOf(t.date) === thisMonth && t.type === 'income') && txs.some((t) => t.type === 'expense'),
    },
    {
      title: 'Build a starter emergency fund',
      detail: `Save a small cushion (about ${formatMoney(starter, settings.currency)}) so surprises don't go on a credit card.`,
      done: emergencySaved >= starter,
    },
    {
      title: 'Clear credit cards & high-interest debt',
      detail: 'Pay minimums on everything, throw every extra coin at the focus debt, then close the card.',
      done: cleared(highInterest),
    },
    {
      title: 'Pay off the car loan & remaining debt',
      detail: 'Roll the money you freed up from the cards straight into the car loan.',
      done: cleared(otherDebt) && cleared(highInterest),
    },
    {
      title: 'Complete a 3–6 month emergency fund',
      detail: 'Keep it in a separate high-yield savings account you do not touch.',
      done: emergencySaved >= fullEmergency,
    },
    {
      title: 'Invest for the future every month',
      detail: 'Aim for ~15% of income into long-term, low-cost diversified funds (take any employer match first).',
      done: investingThisMonth,
    },
    {
      title: 'Save your house down payment',
      detail: 'Create a House goal and add to it every payday.',
      done: houseProgress,
    },
  ];
}
