import { Column, Text } from '@expo/ui/jetpack-compose';
import {
  background,
  cornerRadius,
  fillMaxSize,
  paddingAll,
} from '@expo/ui/jetpack-compose/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

export type StreakWidgetProps = {
  current: number;
  /** The last local day with study activity as "YYYY-MM-DD", or "" before any study. */
  lastStudiedDay: string;
};

/**
 * 1×1 home-screen widget with the study streak: orange once today's study is done, grey until then.
 * It runs in an isolated runtime, so everything it needs lives inside the function. Whether
 * today is done is worked out at render time, so a re-render after midnight shows it grey even
 * if the app has not been opened since.
 */
const StreakWidget = (props: StreakWidgetProps, environment: WidgetEnvironment) => {
  'widget';
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate(),
  ).padStart(2, '0')}`;
  const done = props.lastStudiedDay === today;
  const dark = environment.colorScheme === 'dark';

  const surface = done ? (dark ? '#431407' : '#FFF7ED') : dark ? '#0F172A' : '#F1F5F9';
  const primary = done ? (dark ? '#F8FAFC' : '#0F172A') : dark ? '#94A3B8' : '#64748B';

  // 1×1: just the icon and the count. An emoji cannot be tinted grey, so a pending day shows an
  // hourglass (time is running out) instead of the flame.
  return (
    <Column
      verticalArrangement="center"
      horizontalAlignment="center"
      modifiers={[fillMaxSize(), cornerRadius(20), background(surface), paddingAll(4)]}
    >
      <Text style={{ fontSize: 22 }}>{done ? '🔥' : '⏳'}</Text>
      <Text color={primary} style={{ fontSize: 20, fontWeight: 'bold' }}>
        {props.current}
      </Text>
    </Column>
  );
};

export default createWidget('StreakWidget', StreakWidget, { current: 0, lastStudiedDay: '' });
