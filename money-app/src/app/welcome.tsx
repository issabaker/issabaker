import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text } from 'react-native';
import { ProfileForm, type ProfileDraft } from '../components/profile-form';
import { Button, Card, Muted, Screen } from '../components/ui';
import { parseAmount } from '../lib/finance';
import { useStore } from '../lib/store';
import { colors, space } from '../lib/theme';

export default function Welcome() {
  const { updateSettings } = useStore();
  const [draft, setDraft] = useState<ProfileDraft>({ name: '', currency: '$', salary: '' });

  const start = () => {
    updateSettings({
      name: draft.name.trim(),
      currency: draft.currency.trim() || '$',
      monthlySalary: parseAmount(draft.salary),
      onboarded: true,
    });
    router.replace('/');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen>
        <Text style={styles.emoji}>💸</Text>
        <Text style={styles.title}>Let's take control of your money</Text>
        <Muted style={{ textAlign: 'center' }}>
          Track your salary, spending and savings every day. Crush your credit cards and car loan. Save for your home and invest for your future.
        </Muted>
        <Card>
          <ProfileForm value={draft} onChange={setDraft} />
          <Button title="Let's go 🚀" onPress={start} />
        </Card>
        <Muted style={{ textAlign: 'center', fontSize: 12 }}>
          Your data stays on this phone. No account, no internet needed.
        </Muted>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  emoji: { fontSize: 56, textAlign: 'center', marginTop: space(6) },
  title: { fontSize: 26, fontWeight: '800', color: colors.text, textAlign: 'center' },
});
