import { View } from 'react-native';
import { space } from '../lib/theme';
import { Chip, Field } from './ui';

export const CURRENCIES = ['$', '€', '£', 'AED', 'SAR', 'QAR', 'KWD', 'EGP', '₹', 'C$', 'A$'];

export interface ProfileDraft {
  name: string;
  currency: string;
  salary: string;
}

/** Name, currency and monthly salary — shared by the welcome and settings screens. */
export function ProfileForm({ value, onChange }: { value: ProfileDraft; onChange: (v: ProfileDraft) => void }) {
  const set = (patch: Partial<ProfileDraft>) => onChange({ ...value, ...patch });
  return (
    <View>
      <Field label="Your name" value={value.name} onChangeText={(name) => set({ name })} placeholder="e.g. Issa" autoCapitalize="words" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space(2), marginBottom: space(2) }}>
        {CURRENCIES.map((c) => (
          <Chip key={c} label={c} selected={value.currency === c} onPress={() => set({ currency: c })} />
        ))}
      </View>
      <Field label="Currency (or type your own)" value={value.currency} onChangeText={(currency) => set({ currency })} maxLength={4} />
      <Field
        label="Monthly take-home salary"
        value={value.salary}
        onChangeText={(salary) => set({ salary })}
        keyboardType="decimal-pad"
        placeholder="0"
      />
    </View>
  );
}
