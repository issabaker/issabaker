import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { Button, Chip, Field, Muted } from '../components/ui';
import { GOAL_KINDS } from '../lib/categories';
import { parseAmount } from '../lib/finance';
import { useStore, type GoalKind } from '../lib/store';
import { space } from '../lib/theme';

export default function GoalEdit() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { data, saveGoal, deleteGoal } = useStore();
  const existing = data.goals.find((g) => g.id === id);

  const [kind, setKind] = useState<GoalKind>(existing?.kind ?? 'emergency');
  const [name, setName] = useState(existing?.name ?? '');
  const [target, setTarget] = useState(existing ? String(existing.target) : '');
  const [start, setStart] = useState(existing?.startAmount ? String(existing.startAmount) : '');

  const label = GOAL_KINDS.find((k) => k.value === kind)?.label ?? 'Goal';
  const canSave = parseAmount(target) > 0;

  const save = () => {
    saveGoal({ id: existing?.id, kind, name: name.trim() || label, target: parseAmount(target), startAmount: parseAmount(start) });
    router.back();
  };

  const remove = () =>
    Alert.alert('Delete goal?', 'This also removes the savings entries linked to it.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteGoal(existing!.id);
          router.back();
        },
      },
    ]);

  return (
    <ScrollView contentContainerStyle={{ padding: space(4), gap: space(2) }} keyboardShouldPersistTaps="handled">
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space(2), marginBottom: space(3) }}>
        {GOAL_KINDS.map((k) => (
          <Chip key={k.value} label={k.label} icon={k.icon} selected={kind === k.value} onPress={() => setKind(k.value)} />
        ))}
      </View>
      <Field label="Name" value={name} onChangeText={setName} placeholder={label} />
      <Field label="Target amount" value={target} onChangeText={setTarget} keyboardType="decimal-pad" placeholder="0" />
      <Field label="Already saved (optional)" value={start} onChangeText={setStart} keyboardType="decimal-pad" placeholder="0" />
      <Muted style={{ marginBottom: space(3) }}>
        {kind === 'emergency' && 'Aim for 3–6 months of essential expenses, in a separate savings account.'}
        {kind === 'house' && 'Include the down payment plus closing costs and moving/furniture money.'}
        {kind === 'invest' && 'Money you won’t need for 5+ years. Invest a fixed amount every month.'}
        {kind === 'retirement' && 'Start early — time and compound growth do most of the work.'}
        {kind === 'car' && 'Saving up and paying cash means no new car loan.'}
        {kind === 'other' && 'Name it, set the target, and add to it every payday.'}
      </Muted>
      <Button title={existing ? 'Save changes' : 'Create goal'} icon="checkmark" onPress={save} disabled={!canSave} />
      {existing && <Button title="Delete goal" icon="trash-outline" variant="danger" onPress={remove} />}
    </ScrollView>
  );
}
