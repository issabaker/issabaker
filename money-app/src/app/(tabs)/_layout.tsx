import { Ionicons } from '@expo/vector-icons';
import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { ActivityIndicator, View, type ColorValue } from 'react-native';
import type { IconName } from '../../lib/categories';
import { useStore } from '../../lib/store';
import { colors } from '../../lib/theme';

const icon =
  (name: IconName) =>
  ({ color, size }: { color: ColorValue; size: number }) => <Ionicons name={name} color={color} size={size} />;

export default function TabsLayout() {
  const { data, loaded } = useStore();

  if (!loaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  if (!data.settings.onboarded) return <Redirect href="/welcome" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        tabBarLabelStyle: { fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: icon('home') }} />
      <Tabs.Screen name="history" options={{ title: 'History', tabBarIcon: icon('list') }} />
      <Tabs.Screen name="debts" options={{ title: 'Debts', tabBarIcon: icon('card') }} />
      <Tabs.Screen name="goals" options={{ title: 'Goals', tabBarIcon: icon('flag') }} />
      <Tabs.Screen name="inspire" options={{ title: 'Inspire', tabBarIcon: icon('sparkles') }} />
    </Tabs>
  );
}
