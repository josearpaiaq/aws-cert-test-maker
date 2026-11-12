import { Text, View } from 'react-native';

import type { ExamDomain } from '@/data/exam-config';
import { READINESS_THRESHOLD, READINESS_WINDOW, type Readiness } from '@/logic/readiness';

type ReadinessCardProps = {
  readiness: Readiness;
  domains: readonly ExamDomain[];
};

const percent = (fraction: number) => `${Math.round(fraction * 100)}%`;

/** The "ready to book?" indicator: every domain needs 80% over its last 50 answers. */
export function ReadinessCard({ readiness, domains }: ReadinessCardProps) {
  return (
    <View className="gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
      <View className="flex-row items-center justify-between gap-3">
        <Text
          accessibilityRole="header"
          className="text-lg font-semibold text-slate-900 dark:text-slate-50"
        >
          Ready to book?
        </Text>
        <View
          className={`rounded-full px-3 py-1 ${
            readiness.ready ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-700'
          }`}
        >
          <Text
            className={`text-sm font-semibold ${
              readiness.ready ? 'text-white' : 'text-slate-800 dark:text-slate-100'
            }`}
          >
            {readiness.ready ? '✓ Ready' : 'Not yet'}
          </Text>
        </View>
      </View>
      <Text className="text-sm leading-5 text-slate-600 dark:text-slate-400">
        Every domain needs {percent(READINESS_THRESHOLD)} or better over its last {READINESS_WINDOW}{' '}
        answers.
      </Text>

      {readiness.domains.map((domain) => {
        const name = domains.find((d) => d.id === domain.domain)?.name ?? '';
        const status =
          domain.accuracy === null
            ? 'No answers yet'
            : `${percent(domain.accuracy)} · ${domain.answered} of ${READINESS_WINDOW} answers`;
        return (
          <View
            key={domain.domain}
            accessible
            accessibilityLabel={`${name}: ${status}${domain.ready ? ', ready' : ''}`}
            className="gap-2"
          >
            <View className="flex-row items-baseline justify-between gap-3">
              <Text className="flex-1 text-base font-medium text-slate-900 dark:text-slate-50">
                {domain.ready ? '✓ ' : ''}
                {name}
              </Text>
              <Text className="text-sm tabular-nums text-slate-600 dark:text-slate-400">
                {status}
              </Text>
            </View>
            <View className="h-2 rounded-full bg-slate-200 dark:bg-slate-800">
              <View
                style={{ width: `${(domain.accuracy ?? 0) * 100}%` }}
                className="h-2 rounded-full bg-sky-500"
              />
              {/* Target marker at the readiness threshold. */}
              <View
                style={{ left: `${READINESS_THRESHOLD * 100}%` }}
                className="absolute -top-1 h-4 w-0.5 bg-slate-500 dark:bg-slate-300"
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}
