import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CLF_C02 } from '@/data/exams/clf-c02';
import { getQuestionBank } from '@/data/question-bank';
import { questionsForAttempt } from '@/db/exam-attempts';
import type { ExamAttempt } from '@/db/repository';
import { useRepository } from '@/db/use-repository';
import { scoreExam, type ExamScore } from '@/logic/scoring';

type Loaded = { attempt: ExamAttempt; score: ExamScore };

const percent = (fraction: number) => `${Math.round(fraction * 100)}%`;

export default function ExamResultsScreen() {
  const { attemptId } = useLocalSearchParams<{ attemptId: string }>();
  const repo = useRepository();
  const [result, setResult] = useState<Loaded | 'missing' | null>(null);

  useEffect(() => {
    let cancelled = false;
    repo
      .getExamAttempt(Number(attemptId))
      .then((attempt) => {
        if (cancelled) return;
        if (!attempt) {
          setResult('missing');
          return;
        }
        const questions = questionsForAttempt(attempt, getQuestionBank());
        setResult({ attempt, score: scoreExam(questions, attempt.responses) });
      })
      .catch(() => {
        if (!cancelled) setResult('missing');
      });
    return () => {
      cancelled = true;
    };
  }, [repo, attemptId]);

  if (result === null) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white dark:bg-black">
        <ActivityIndicator size="large" accessibilityLabel="Loading results" />
      </SafeAreaView>
    );
  }

  const done = (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.back()}
      className="min-h-14 items-center justify-center rounded-2xl bg-sky-700 py-3 active:bg-sky-800"
    >
      <Text maxFontSizeMultiplier={1.5} className="text-center text-lg font-semibold text-white">
        Done
      </Text>
    </Pressable>
  );

  if (result === 'missing') {
    return (
      <SafeAreaView className="flex-1 justify-center gap-6 bg-white px-5 dark:bg-black">
        <Text
          maxFontSizeMultiplier={1.6}
          className="text-center text-xl font-semibold text-slate-900 dark:text-slate-50"
        >
          This result could not be found.
        </Text>
        {done}
      </SafeAreaView>
    );
  }

  const { attempt, score } = result;
  const minutes = Math.max(
    1,
    Math.round(((attempt.submittedAt ?? attempt.startedAt) - attempt.startedAt) / 60000),
  );

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <ScrollView contentContainerClassName="gap-6 px-5 pb-6 pt-8">
        <View className="items-center gap-1">
          <Text className="text-base font-medium text-slate-600 dark:text-slate-400">
            Mock exam result
          </Text>
          <Text
            maxFontSizeMultiplier={1.3}
            accessibilityRole="header"
            className="text-6xl font-bold text-slate-900 dark:text-slate-50"
          >
            {percent(score.accuracy)}
          </Text>
          <Text className="text-lg text-slate-700 dark:text-slate-300">
            {score.correct} of {score.total} correct · {minutes} min
          </Text>
        </View>

        <View className="gap-4">
          <Text className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            By domain
          </Text>
          {score.byDomain.map((domain) => {
            const name = CLF_C02.domains.find((d) => d.id === domain.domain)?.name ?? '';
            const fraction = domain.total === 0 ? 0 : domain.correct / domain.total;
            return (
              <View
                key={domain.domain}
                accessible
                accessibilityLabel={`${name}: ${domain.correct} of ${domain.total} correct, ${percent(fraction)}`}
                className="gap-2"
              >
                <View className="flex-row items-baseline justify-between gap-3">
                  <Text className="flex-1 text-base font-medium text-slate-900 dark:text-slate-50">
                    {name}
                  </Text>
                  <Text className="text-base tabular-nums text-slate-700 dark:text-slate-300">
                    {domain.correct}/{domain.total} · {percent(fraction)}
                  </Text>
                </View>
                <View className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <View
                    style={{ width: `${fraction * 100}%` }}
                    className="h-2 rounded-full bg-sky-500"
                  />
                </View>
              </View>
            );
          })}
        </View>

        <Text className="text-sm leading-5 text-slate-500 dark:text-slate-400">
          This is the share of questions you answered correctly. The real exam reports a scaled
          score from {CLF_C02.scaledScore.min} to {CLF_C02.scaledScore.max} with{' '}
          {CLF_C02.scaledScore.passing} to pass, and AWS does not publish how raw scores convert, so
          no pass or fail is shown here.
        </Text>
      </ScrollView>
      <View className="border-t border-slate-200 px-5 pb-2 pt-3 dark:border-slate-800">{done}</View>
    </SafeAreaView>
  );
}
