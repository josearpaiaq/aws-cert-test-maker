import '@/global.css';

import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider,
  type ErrorBoundaryProps,
} from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { Pressable, Text, useColorScheme, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { migrate } from '@/db/migrations';
import { useReminderLink } from '@/notifications/use-reminder-link';

/**
 * Shown instead of a blank screen when a screen throws while rendering, for example when the
 * database cannot be opened or the bundled question bank fails validation.
 */
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-white px-8 dark:bg-black">
      <Text
        maxFontSizeMultiplier={1.4}
        accessibilityRole="header"
        className="text-center text-2xl font-bold text-slate-900 dark:text-slate-50"
      >
        Something went wrong
      </Text>
      <Text className="text-center text-base text-slate-600 dark:text-slate-400">
        CloudPrep hit an unexpected problem. Your saved progress is not affected.
      </Text>
      {__DEV__ && (
        <Text className="text-center text-sm text-rose-700 dark:text-rose-400">
          {error.message}
        </Text>
      )}
      <Pressable
        accessibilityRole="button"
        onPress={() => void retry()}
        className="min-h-14 items-center justify-center rounded-2xl bg-sky-700 px-8 py-3 active:bg-sky-800"
      >
        <Text maxFontSizeMultiplier={1.5} className="text-center text-lg font-semibold text-white">
          Try again
        </Text>
      </Pressable>
    </View>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  useReminderLink();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <SQLiteProvider databaseName="cloudprep.db" onInit={migrate}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="practice" />
            <Stack.Screen name="exam-session" options={{ gestureEnabled: false }} />
            <Stack.Screen name="exam-results" />
            <Stack.Screen
              name="lesson/[id]"
              options={{ headerShown: true, headerBackButtonDisplayMode: 'minimal' }}
            />
            <Stack.Screen
              name="browse"
              options={{
                headerShown: true,
                title: 'Question bank',
                headerBackButtonDisplayMode: 'minimal',
              }}
            />
            <Stack.Screen
              name="settings"
              options={{
                headerShown: true,
                title: 'Settings',
                headerBackButtonDisplayMode: 'minimal',
              }}
            />
          </Stack>
        </SQLiteProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
