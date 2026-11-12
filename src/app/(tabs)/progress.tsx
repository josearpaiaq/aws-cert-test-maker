import { FlashList } from '@shopify/flash-list';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AccuracyChart } from '@/components/progress/accuracy-chart';
import { ReadinessCard } from '@/components/progress/readiness-card';
import { CLF_C02 } from '@/data/exams/clf-c02';
import { HISTORY_DAYS, loadProgress, type Progress } from '@/data/progress';
import type { ExamAttempt } from '@/db/repository';
import { useRepository } from '@/db/use-repository';

function StatTile(props: { value: string; label: string; detail: string }) {
  return (
    <View
      accessible
      accessibilityLabel={`${props.label}: ${props.value}. ${props.detail}`}
      className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900"
    >
      <Text className="text-sm font-medium text-slate-500 dark:text-slate-400">{props.label}</Text>
      <Text className="mt-1 text-3xl font-bold text-slate-900 dark:text-slate-50">
        {props.value}
      </Text>
      <Text className="mt-1 text-sm text-slate-600 dark:text-slate-400">{props.detail}</Text>
    </View>
  );
}

function ExamRow({ attempt }: { attempt: ExamAttempt }) {
  const correct = attempt.correctCount ?? 0;
  const total = attempt.totalCount ?? 0;
  const score = total === 0 ? 0 : Math.round((correct / total) * 100);
  const date = new Date(attempt.submittedAt ?? attempt.startedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Mock exam on ${date}: ${score} percent, ${correct} of ${total} correct`}
      accessibilityHint="Opens the result by domain"
      onPress={() =>
        router.push({ pathname: '/exam-results', params: { attemptId: String(attempt.id) } })
      }
      className="mx-5 mb-3 flex-row items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 active:opacity-70 dark:border-slate-800 dark:bg-slate-900"
    >
      <View>
        <Text className="text-base font-medium text-slate-900 dark:text-slate-50">{date}</Text>
        <Text className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
          {correct} of {total} correct
        </Text>
      </View>
      <Text className="text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-50">
        {score}%
      </Text>
    </Pressable>
  );
}

export default function ProgressScreen() {
  const repo = useRepository();
  const [progress, setProgress] = useState<Progress | null>(null);
  const [failed, setFailed] = useState(false);

  // Reload on focus so answers from other tabs show up straight away.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      loadProgress(repo, Date.now())
        .then((loaded) => {
          if (!cancelled) {
            setProgress(loaded);
            setFailed(false);
          }
        })
        .catch(() => {
          if (!cancelled) setFailed(true);
        });
      return () => {
        cancelled = true;
      };
    }, [repo]),
  );

  if (!progress) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white px-8 dark:bg-black">
        {failed ? (
          <Text className="text-center text-lg text-slate-900 dark:text-slate-50">
            Your progress could not be loaded.
          </Text>
        ) : (
          <ActivityIndicator size="large" accessibilityLabel="Loading progress" />
        )}
      </SafeAreaView>
    );
  }

  const { streak } = progress;
  const header = (
    <View className="gap-4 px-5 pb-4 pt-4">
      <Text
        accessibilityRole="header"
        className="text-3xl font-bold text-slate-900 dark:text-slate-50"
      >
        Progress
      </Text>

      {progress.totalAnswered === 0 && (
        <Text className="text-base leading-6 text-slate-600 dark:text-slate-400">
          Nothing here yet. Answer a few practice questions and your progress will show up.
        </Text>
      )}

      <View className="flex-row gap-3">
        <StatTile
          label="Streak"
          value={`${streak.current} ${streak.current === 1 ? 'day' : 'days'}`}
          detail={streak.studiedToday ? 'Studied today' : 'Not studied yet today'}
        />
        <StatTile
          label="Answered"
          value={String(progress.totalAnswered)}
          detail="Questions in total"
        />
      </View>

      <ReadinessCard readiness={progress.readiness} domains={CLF_C02.domains} />
      <AccuracyChart
        answers={progress.recentAnswers}
        domains={CLF_C02.domains}
        now={progress.loadedAt}
        days={HISTORY_DAYS}
      />

      <Text className="mt-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Mock exams
      </Text>
    </View>
  );

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white dark:bg-black">
      <FlashList
        data={progress.examHistory}
        keyExtractor={(attempt) => String(attempt.id)}
        renderItem={({ item }) => <ExamRow attempt={item} />}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <Text className="px-5 text-base text-slate-600 dark:text-slate-400">
            No mock exams yet. Take one from the Exam tab.
          </Text>
        }
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </SafeAreaView>
  );
}
