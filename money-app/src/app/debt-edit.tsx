import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { Button, Chip, Field, Muted } from '../components/ui';
import { DEBT_KINDS } from '../lib/categories';
import { debtBalance, parseAmount } from '../lib/finance';
import { useStore, type DebtKind } from '../lib/store';
import { space } from '../lib/theme';

export default function DebtEdit() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { data, saveDebt, deleteDebt } = useStore();
  const existing = data.debts.find((d) => d.id === id);
  const currentBalance = existing ? debtBalance(existing, data.transactions) : 0;
  const paidSoFar = existing ? existing.startBalance - currentBalance : 0;

  const [name, setName] = useState(existing?.name ?? '');
  const [kind, setKind] = useState<DebtKind>(existing?.kind ?? 'credit_card');
  const [balance, setBalance] = useState(existing ? String(currentBalance) : '');
  const [apr, setApr] = useState(existing ? String(existing.apr) : '');
  const [min, setMin] = useState(existing ? String(existing.minPayment) : '');

  const bal = parseAmount(balance);
  const canSave = name.trim().length > 0 && (bal > 0 || !!existing);

  const save = () => {
    saveDebt({
      id: existing?.id,
      name: name.trim(),
      kind,
      // Keep past payments in history: start balance = what's left now + what was already paid
      startBalance: bal + Math.max(0, paidSoFar),
      apr: Number(apr.replace(',', '.')) || 0,
      minPayment: parseAmount(min),
    });
    router.back();
  };

  const remove = () =>
    Alert.alert('Delete debt?', 'This also removes its payment history.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteDebt(existing!.id);
          router.back();
        },
      },
    ]);

  return (
    <ScrollView contentContainerStyle={{ padding: space(4), gap: space(2) }} keyboardShouldPersistTaps="handled">
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space(2), marginBottom: space(3) }}>
        {DEBT_KINDS.map((k) => (
          <Chip key={k.value} label={k.label} icon={k.icon} selected={kind === k.value} onPress={() => setKind(k.value)} />
        ))}
      </View>
      <Field label="Name" value={name} onChangeText={setName} placeholder="e.g. Visa card, Toyota loan" />
      <Field label="Current balance" value={balance} onChangeText={setBalance} keyboardType="decimal-pad" placeholder="0" />
      <Field label="Interest rate (APR %)" value={apr} onChangeText={setApr} keyboardType="decimal-pad" placeholder="e.g. 24.9" />
      <Field label="Minimum monthly payment" value={min} onChangeText={setMin} keyboardType="decimal-pad" placeholder="0" />
      <Muted style={{ marginBottom: space(3) }}>
        Find these numbers on your latest statement or banking app. Log payments with the “Pay” button to watch the balance drop.
      </Muted>
      <Button title={existing ? 'Save changes' : 'Add debt'} icon="checkmark" onPress={save} disabled={!canSave} />
      {existing && <Button title="Delete debt" icon="trash-outline" variant="danger" onPress={remove} />}
    </ScrollView>
  );
}
