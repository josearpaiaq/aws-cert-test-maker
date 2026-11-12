import '@/global.css';

import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { NativeTabs } from 'expo-router/native-tabs';
import { useColorScheme } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <NativeTabs>
        <NativeTabs.Trigger name="index">
          <NativeTabs.Trigger.Label>Study</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf={{ default: 'book', selected: 'book.fill' }} md="menu_book" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="exam">
          <NativeTabs.Trigger.Label>Exam</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="timer" md="timer" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="progress">
          <NativeTabs.Trigger.Label>Progress</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: 'chart.bar', selected: 'chart.bar.fill' }}
            md="bar_chart"
          />
        </NativeTabs.Trigger>
      </NativeTabs>
    </ThemeProvider>
  );
}
