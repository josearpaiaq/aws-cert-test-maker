import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { ExamDomain } from '@/data/exam-config';
import { dailyAccuracy } from '@/logic/accuracy-history';

type AccuracyChartProps = {
  answers: readonly { domain: number; isCorrect: boolean; answeredAt: number }[];
  domains: readonly ExamDomain[];
  now: number;
  days: number;
};

const CHART_HEIGHT = 120;
const percent = (fraction: number) => `${Math.round(fraction * 100)}%`;
const shortDate = (timestamp: number) =>
  new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

/**
 * Daily accuracy as a bar chart, for all domains or one. Days without answers are left
 * empty rather than drawn as zero. Tapping a bar shows that day's numbers.
 */
export function AccuracyChart({ answers, domains, now, days }: AccuracyChartProps) {
  const [domain, setDomain] = useState<number | undefined>(undefined);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const history = dailyAccuracy(answers, now, days, domain);
  const hasData = history.some((day) => day.total > 0);
  const selected = history.find((day) => day.day === selectedDay && day.total > 0);

  const filters = [
    { id: undefined, label: 'All' },
    ...domains.map((d) => ({ id: d.id, label: `Domain ${d.id}` })),
  ];

  return (
    <View className="gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
      <Text
        accessibilityRole="header"
        className="text-lg font-semibold text-slate-900 dark:text-slate-50"
      >
        Accuracy, last {days} days
      </Text>

      <View accessibilityRole="tablist" className="flex-row flex-wrap gap-2">
        {filters.map((filter) => {
          const active = filter.id === domain;
          return (
            <Pressable
              key={filter.label}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              hitSlop={6}
              onPress={() => setDomain(filter.id)}
              className={`rounded-full border px-3 py-1.5 active:opacity-70 ${
                active
                  ? 'border-sky-600 bg-sky-600'
                  : 'border-slate-300 bg-transparent dark:border-slate-700'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  active ? 'text-white' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {hasData ? (
        <>
          <View className="flex-row gap-2">
            <View style={{ height: CHART_HEIGHT }} className="justify-between">
              <Text className="text-xs tabular-nums text-slate-500 dark:text-slate-400">100%</Text>
              <Text className="text-xs tabular-nums text-slate-500 dark:text-slate-400">0%</Text>
            </View>
            <View
              style={{ height: CHART_HEIGHT }}
              className="flex-1 flex-row items-end gap-0.5 border-b border-slate-300 dark:border-slate-700"
            >
              {history.map((day) => {
                const isSelected = day.day === selectedDay;
                return (
                  <Pressable
                    key={day.day}
                    accessibilityRole="button"
                    accessibilityLabel={
                      day.accuracy === null
                        ? `${shortDate(day.date)}: no answers`
                        : `${shortDate(day.date)}: ${day.correct} of ${day.total} correct, ${percent(day.accuracy)}`
                    }
                    disabled={day.total === 0}
                    onPress={() => setSelectedDay(isSelected ? null : day.day)}
                    style={{ height: CHART_HEIGHT }}
                    className="flex-1 justify-end"
                  >
                    {day.accuracy !== null && (
                      <View
                        // A day at 0% still gets a sliver so it reads as "answered, all wrong".
                        style={{ height: Math.max(3, day.accuracy * CHART_HEIGHT) }}
                        className={`rounded-t ${
                          isSelected ? 'bg-sky-700 dark:bg-sky-300' : 'bg-sky-500'
                        }`}
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
          <View className="flex-row justify-between pl-10">
            <Text className="text-xs text-slate-500 dark:text-slate-400">
              {shortDate(history[0].date)}
            </Text>
            <Text className="text-xs text-slate-500 dark:text-slate-400">Today</Text>
          </View>
          <Text
            accessibilityLiveRegion="polite"
            className="text-sm text-slate-700 dark:text-slate-300"
          >
            {selected && selected.accuracy !== null
              ? `${shortDate(selected.date)}: ${selected.correct} of ${selected.total} correct (${percent(selected.accuracy)})`
              : 'Tap a bar to see that day.'}
          </Text>
        </>
      ) : (
        <Text className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
          No answers in the last {days} days{domain === undefined ? '' : ' for this domain'}.
        </Text>
      )}
    </View>
  );
}
