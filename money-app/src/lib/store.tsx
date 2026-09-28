import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

export type TxType = 'income' | 'expense' | 'saving' | 'debt';

export interface Transaction {
  id: string;
  type: TxType;
  amount: number;
  /** Category id for income/expense. Unused for saving/debt (they link to a goal/debt). */
  category: string;
  note?: string;
  /** Local date, YYYY-MM-DD */
  date: string;
  goalId?: string;
  debtId?: string;
  createdAt: number;
}

export type DebtKind = 'credit_card' | 'car_loan' | 'personal_loan' | 'student_loan' | 'other';

export interface Debt {
  id: string;
  name: string;
  kind: DebtKind;
  /** Balance on the day the debt was added. Payments are subtracted from this. */
  startBalance: number;
  /** Annual interest rate, in percent */
  apr: number;
  minPayment: number;
  createdAt: number;
}

export type GoalKind = 'emergency' | 'house' | 'invest' | 'retirement' | 'car' | 'other';

export interface Goal {
  id: string;
  name: string;
  kind: GoalKind;
  target: number;
  /** Amount already saved before using the app */
  startAmount: number;
  createdAt: number;
}

export type Strategy = 'avalanche' | 'snowball';

export interface Settings {
  name: string;
  currency: string;
  monthlySalary: number;
  /** Total amount per month the user can put toward debts (minimums + extra) */
  debtBudget: number;
  strategy: Strategy;
  onboarded: boolean;
}

export interface AppData {
  version: 1;
  settings: Settings;
  transactions: Transaction[];
  debts: Debt[];
  goals: Goal[];
}

const STORAGE_KEY = 'money-app/data/v1';

export const DEFAULT_DATA: AppData = {
  version: 1,
  settings: {
    name: '',
    currency: '$',
    monthlySalary: 0,
    debtBudget: 0,
    strategy: 'avalanche',
    onboarded: false,
  },
  transactions: [],
  debts: [],
  goals: [],
};

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function isAppData(value: unknown): value is AppData {
  const v = value as AppData;
  return (
    !!v &&
    v.version === 1 &&
    typeof v.settings === 'object' &&
    Array.isArray(v.transactions) &&
    Array.isArray(v.debts) &&
    Array.isArray(v.goals)
  );
}

interface Store {
  data: AppData;
  loaded: boolean;
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  deleteTransaction: (id: string) => void;
  saveDebt: (debt: Omit<Debt, 'id' | 'createdAt'> & { id?: string }) => void;
  deleteDebt: (id: string) => void;
  saveGoal: (goal: Omit<Goal, 'id' | 'createdAt'> & { id?: string }) => void;
  deleteGoal: (id: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  replaceAll: (data: AppData) => void;
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(DEFAULT_DATA);
  const [loaded, setLoaded] = useState(false);
  const skipNextSave = useRef(true);

  // Everything lives on the device, so the app works fully offline.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (isAppData(parsed)) {
          setData({ ...parsed, settings: { ...DEFAULT_DATA.settings, ...parsed.settings } });
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => {});
  }, [data, loaded]);

  const addTransaction = useCallback<Store['addTransaction']>((tx) => {
    setData((d) => ({
      ...d,
      transactions: [{ ...tx, id: newId(), createdAt: Date.now() }, ...d.transactions],
    }));
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setData((d) => ({ ...d, transactions: d.transactions.filter((t) => t.id !== id) }));
  }, []);

  const saveDebt = useCallback<Store['saveDebt']>((debt) => {
    setData((d) => {
      if (debt.id) {
        return { ...d, debts: d.debts.map((x) => (x.id === debt.id ? { ...x, ...debt, id: x.id } : x)) };
      }
      return { ...d, debts: [...d.debts, { ...debt, id: newId(), createdAt: Date.now() }] };
    });
  }, []);

  const deleteDebt = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      debts: d.debts.filter((x) => x.id !== id),
      transactions: d.transactions.filter((t) => t.debtId !== id),
    }));
  }, []);

  const saveGoal = useCallback<Store['saveGoal']>((goal) => {
    setData((d) => {
      if (goal.id) {
        return { ...d, goals: d.goals.map((x) => (x.id === goal.id ? { ...x, ...goal, id: x.id } : x)) };
      }
      return { ...d, goals: [...d.goals, { ...goal, id: newId(), createdAt: Date.now() }] };
    });
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      goals: d.goals.filter((x) => x.id !== id),
      transactions: d.transactions.filter((t) => t.goalId !== id),
    }));
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setData((d) => ({ ...d, settings: { ...d.settings, ...patch } }));
  }, []);

  const replaceAll = useCallback((next: AppData) => setData(next), []);

  const value = useMemo<Store>(
    () => ({
      data,
      loaded,
      addTransaction,
      deleteTransaction,
      saveDebt,
      deleteDebt,
      saveGoal,
      deleteGoal,
      updateSettings,
      replaceAll,
    }),
    [data, loaded, addTransaction, deleteTransaction, saveDebt, deleteDebt, saveGoal, deleteGoal, updateSettings, replaceAll],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used inside StoreProvider');
  return store;
}
