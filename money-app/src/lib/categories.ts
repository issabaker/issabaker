import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';
import type { DebtKind, GoalKind } from './store';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export type Bucket = 'needs' | 'wants';

export interface Category {
  id: string;
  label: string;
  icon: IconName;
  bucket?: Bucket;
}

export const INCOME_CATEGORIES: Category[] = [
  { id: 'salary', label: 'Salary', icon: 'briefcase' },
  { id: 'bonus', label: 'Bonus', icon: 'trophy' },
  { id: 'side', label: 'Side hustle', icon: 'rocket' },
  { id: 'gift_in', label: 'Gift', icon: 'gift' },
  { id: 'refund', label: 'Refund', icon: 'return-down-back' },
  { id: 'other_in', label: 'Other', icon: 'cash' },
];

export const EXPENSE_CATEGORIES: Category[] = [
  { id: 'housing', label: 'Rent / Mortgage', icon: 'home', bucket: 'needs' },
  { id: 'utilities', label: 'Bills & Utilities', icon: 'flash', bucket: 'needs' },
  { id: 'groceries', label: 'Groceries', icon: 'cart', bucket: 'needs' },
  { id: 'transport', label: 'Transport & Fuel', icon: 'car', bucket: 'needs' },
  { id: 'phone', label: 'Phone & Internet', icon: 'phone-portrait', bucket: 'needs' },
  { id: 'insurance', label: 'Insurance', icon: 'shield-checkmark', bucket: 'needs' },
  { id: 'health', label: 'Health', icon: 'medkit', bucket: 'needs' },
  { id: 'family', label: 'Kids & Family', icon: 'people', bucket: 'needs' },
  { id: 'education', label: 'Education', icon: 'school', bucket: 'needs' },
  { id: 'eating_out', label: 'Eating out', icon: 'restaurant', bucket: 'wants' },
  { id: 'coffee', label: 'Coffee & Snacks', icon: 'cafe', bucket: 'wants' },
  { id: 'shopping', label: 'Shopping', icon: 'bag-handle', bucket: 'wants' },
  { id: 'fun', label: 'Fun & Hobbies', icon: 'film', bucket: 'wants' },
  { id: 'subscriptions', label: 'Subscriptions', icon: 'repeat', bucket: 'wants' },
  { id: 'travel', label: 'Travel', icon: 'airplane', bucket: 'wants' },
  { id: 'personal', label: 'Personal care', icon: 'cut', bucket: 'wants' },
  { id: 'giving', label: 'Gifts & Charity', icon: 'heart', bucket: 'wants' },
  { id: 'other_out', label: 'Other', icon: 'ellipsis-horizontal', bucket: 'wants' },
];

const ALL = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

export function findCategory(id: string): Category | undefined {
  return ALL.find((c) => c.id === id);
}

export const DEBT_KINDS: { value: DebtKind; label: string; icon: IconName }[] = [
  { value: 'credit_card', label: 'Credit card', icon: 'card' },
  { value: 'car_loan', label: 'Car loan', icon: 'car' },
  { value: 'personal_loan', label: 'Personal loan', icon: 'cash' },
  { value: 'student_loan', label: 'Student loan', icon: 'school' },
  { value: 'other', label: 'Other', icon: 'document-text' },
];

export const GOAL_KINDS: { value: GoalKind; label: string; icon: IconName; color: string }[] = [
  { value: 'emergency', label: 'Emergency fund', icon: 'umbrella', color: '#2a78d6' },
  { value: 'house', label: 'House', icon: 'home', color: '#1baf7a' },
  { value: 'invest', label: 'Investing', icon: 'trending-up', color: '#7a4fd6' },
  { value: 'retirement', label: 'Retirement', icon: 'sunny', color: '#c98500' },
  { value: 'car', label: 'Car', icon: 'car-sport', color: '#eb6834' },
  { value: 'other', label: 'Other', icon: 'star', color: '#e87ba4' },
];
