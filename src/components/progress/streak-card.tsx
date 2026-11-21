import { Text, View } from 'react-native';

import type { DayState, Streak } from '@/logic/streak';

const dotClass: Record<DayState, string> = {
  studied: 'bg-orange-500',
  frozen: 'bg-sky-400',
  missed: 'bg-slate-200 dark:bg-slate-800',
  pending: 'border-2 border-dashed border-orange-500',
};

const dotLabel: Record<DayState, string> = {
  studied: 'studied',
  frozen: 'saved by a freeze',
  missed: 'missed',
  pending: 'not studied yet',
};

/** "2026-11-11" → its narrow weekday name in the device language, e.g. "W". */
function weekdayInitial(day: string): string {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'narrow' });
}

function statusLine(streak: Streak): string {
  if (streak.studiedToday) return 'Streak extended today. See you tomorrow!';
  if (streak.current === 0) return 'Answer one question to start a streak.';
  return `Study today to keep your ${streak.current}-day streak.`;
}

/** The streak front and centre: the count, the last 7 days, freezes banked and the best run. */
export function StreakCard({ streak }: { streak: Streak }) {
  const atRisk = !streak.studiedToday && streak.current > 0;
  const freezeDetail =
    streak.daysToNextFreeze === null
      ? 'bank full'
      : `next in ${streak.daysToNextFreeze} ${streak.daysToNextFreeze === 1 ? 'day' : 'days'}`;

  return (
    <View
      className={`gap-4 rounded-2xl border-2 p-5 ${
        atRisk
          ? 'border-amber-500 bg-amber-50 dark:border-amber-400 dark:bg-amber-950'
          : 'border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950'
      }`}
    >
      <View
        accessible
        accessibilityLabel={`${streak.current} day streak. ${statusLine(streak)}`}
        className="flex-row items-center gap-3"
      >
        <Text
          maxFontSizeMultiplier={1.2}
          className={`text-5xl ${streak.current === 0 ? 'opacity-40' : ''}`}
        >
          🔥
        </Text>
        <View className="flex-1">
          <Text
            maxFontSizeMultiplier={1.3}
            className="text-4xl font-bold tabular-nums text-slate-900 dark:text-slate-50"
          >
            {streak.current}
            <Text className="text-lg font-semibold text-slate-600 dark:text-slate-400">
              {' '}
              day streak
            </Text>
          </Text>
          <Text
            className={`text-base ${
              atRisk
                ? 'font-semibold text-amber-800 dark:text-amber-300'
                : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            {statusLine(streak)}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between">
        {streak.week.map(({ day, state }) => {
          const initial = weekdayInitial(day);
          return (
            <View
              key={day}
              accessible
              accessibilityLabel={`${initial}: ${dotLabel[state]}`}
              className="items-center gap-1"
            >
              <View
                className={`h-8 w-8 items-center justify-center rounded-full ${dotClass[state]}`}
              >
                {state === 'frozen' && <Text className="text-sm">🧊</Text>}
                {state === 'studied' && <Text className="text-sm font-bold text-white">✓</Text>}
              </View>
              <Text className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {initial}
              </Text>
            </View>
          );
        })}
      </View>

      <View className="flex-row justify-between">
        <Text
          accessibilityLabel={`${streak.freezes} streak freezes, ${freezeDetail}`}
          className="text-sm text-slate-700 dark:text-slate-300"
        >
          🧊 {streak.freezes} {streak.freezes === 1 ? 'freeze' : 'freezes'} · {freezeDetail}
        </Text>
        <Text className="text-sm text-slate-700 dark:text-slate-300">
          Best: {streak.best} {streak.best === 1 ? 'day' : 'days'}
        </Text>
      </View>
    </View>
  );
}

/** A compact streak pill for headers: the count, amber while today's study is still missing. */
export function StreakBadge({ streak }: { streak: Streak }) {
  const atRisk = !streak.studiedToday && streak.current > 0;
  return (
    <View
      accessible
      accessibilityLabel={`${streak.current} day streak. ${statusLine(streak)}`}
      className={`flex-row items-center gap-1 rounded-full px-3 py-1 ${
        atRisk ? 'bg-amber-100 dark:bg-amber-950' : 'bg-orange-50 dark:bg-orange-950'
      }`}
    >
      <Text maxFontSizeMultiplier={1.3} className={streak.current === 0 ? 'opacity-40' : ''}>
        🔥
      </Text>
      <Text
        maxFontSizeMultiplier={1.3}
        className={`text-base font-semibold tabular-nums ${
          atRisk ? 'text-amber-800 dark:text-amber-300' : 'text-slate-900 dark:text-slate-50'
        }`}
      >
        {streak.current}
      </Text>
    </View>
  );
}
