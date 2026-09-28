import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StoreProvider } from '../lib/store';
import { colors } from '../lib/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.bg },
            headerShadowVisible: false,
            headerTintColor: colors.text,
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="welcome" options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="add" options={{ presentation: 'modal', title: 'Add entry' }} />
          <Stack.Screen name="debt-edit" options={{ presentation: 'modal', title: 'Debt' }} />
          <Stack.Screen name="goal-edit" options={{ presentation: 'modal', title: 'Goal' }} />
          <Stack.Screen name="settings" options={{ title: 'Settings' }} />
        </Stack>
      </StoreProvider>
    </SafeAreaProvider>
  );
}
