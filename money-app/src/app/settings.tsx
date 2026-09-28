import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Share } from 'react-native';
import { ProfileForm, type ProfileDraft } from '../components/profile-form';
import { Button, Card, Field, H2, Muted, Screen } from '../components/ui';
import { parseAmount } from '../lib/finance';
import { DEFAULT_DATA, isAppData, useStore } from '../lib/store';
import { space } from '../lib/theme';

export default function Settings() {
  const { data, updateSettings, replaceAll } = useStore();
  const { settings } = data;
  const [draft, setDraft] = useState<ProfileDraft>({
    name: settings.name,
    currency: settings.currency,
    salary: settings.monthlySalary ? String(settings.monthlySalary) : '',
  });
  const [backup, setBackup] = useState('');

  const save = () => {
    updateSettings({ name: draft.name.trim(), currency: draft.currency.trim() || '$', monthlySalary: parseAmount(draft.salary) });
    router.back();
  };

  const exportData = () => Share.share({ message: JSON.stringify(data), title: 'Money app backup' });

  const importData = () => {
    try {
      const parsed = JSON.parse(backup);
      if (!isAppData(parsed)) throw new Error('bad');
      Alert.alert('Restore backup?', 'This replaces everything in the app with the backup.', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          onPress: () => {
            replaceAll(parsed);
            setBackup('');
            router.back();
          },
        },
      ]);
    } catch {
      Alert.alert('That doesn’t look like a backup', 'Paste the full text you exported earlier.');
    }
  };

  const reset = () =>
    Alert.alert('Erase all data?', 'This deletes every entry, debt and goal on this phone. It cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Erase', style: 'destructive', onPress: () => {
          replaceAll(DEFAULT_DATA);
          router.replace('/welcome');
        },
      },
    ]);

  return (
    <Screen hasHeader>
      <Card>
        <H2>Profile</H2>
        <ProfileForm value={draft} onChange={setDraft} />
        <Button title="Save" icon="checkmark" onPress={save} />
      </Card>

      <Card>
        <H2>Backup (works offline)</H2>
        <Muted style={{ marginBottom: space(3) }}>
          All data lives only on this phone. Export a backup to your notes, email or cloud drive, and paste it back to restore — for example on a new phone.
        </Muted>
        <Button title="Export backup" icon="share-outline" variant="soft" onPress={exportData} />
        <Field label="Paste backup to restore" value={backup} onChangeText={setBackup} multiline style={{ minHeight: 80, marginTop: space(3) }} />
        <Button title="Restore backup" icon="download-outline" variant="soft" onPress={importData} disabled={!backup.trim()} />
      </Card>

      <Card>
        <H2>Danger zone</H2>
        <Button title="Erase all data" icon="trash-outline" variant="danger" onPress={reset} />
      </Card>
    </Screen>
  );
}
