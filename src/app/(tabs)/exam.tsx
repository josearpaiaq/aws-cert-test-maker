import * as Haptics from 'expo-haptics';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CLF_C02 } from '@/data/exams/clf-c02';
import { getQuestionBank } from '@/data/question-bank';
import { startExam } from '@/db/exam-attempts';
import type { ExamAttempt } from '@/db/repository';
import { useRepository } from '@/db/use-repository';
import { formatClock, remainingMs } from '@/logic/exam-clock';

type ExamTabState = {
  inProgress: ExamAttempt | null;
  last: ExamAttempt | null;
  /** When this state was read, used to show the time left at that moment. */
  loadedAt: number;
};

export default function ExamScreen() {
  const repo = useRepository();
  const [state, setState] = useState<ExamTabState | null>(null);
  const [failed, setFailed] = useState(false);

  // Reload whenever the tab regains focus, e.g. after leaving or submitting an exam.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      Promise.all([repo.getInProgressExamAttempt(CLF_C02.id), repo.getExamHistory(CLF_C02.id)])
        .then(([inProgress, history]) => {
          if (!cancelled) {
            setState({ inProgress, last: history[0] ?? null, loadedAt: Date.now() });
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

  const bankSize = getQuestionBank().length;
  const examSize = Math.min(bankSize, CLF_C02.totalQuestions);
  const inProgress = state?.inProgress ?? null;
  const last = state?.last ?? null;

  const open = async () => {
    void Haptics.selectionAsync();
    try {
      if (!inProgress) {
        await startExam(repo, CLF_C02, getQuestionBank(), Date.now());
      }
      router.push('/exam-session');
    } catch {
      setFailed(true);
    }
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white dark:bg-black">
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-4 px-5 pb-8 pt-4"
      >
        <Text
          maxFontSizeMultiplier={1.3}
          accessibilityRole="header"
          className="text-3xl font-bold text-slate-900 dark:text-slate-50"
        >
          Mock exam
        </Text>
        <Text className="text-base leading-6 text-slate-600 dark:text-slate-400">
          {examSize} questions weighted by domain, {CLF_C02.durationMinutes} minutes, and no
          feedback until you submit.
        </Text>
        {examSize < CLF_C02.totalQuestions && (
          <Text className="text-sm leading-5 text-slate-500 dark:text-slate-400">
            The real exam has {CLF_C02.totalQuestions} questions. The question bank currently has{' '}
            {bankSize}, so this mock exam is shorter.
          </Text>
        )}

        <Pressable
          accessibilityRole="button"
          disabled={state === null || examSize === 0}
          onPress={() => void open()}
          className={`rounded-2xl bg-sky-700 p-5 active:bg-sky-800 ${
            state === null || examSize === 0 ? 'opacity-40' : ''
          }`}
        >
          <Text maxFontSizeMultiplier={1.5} className="text-lg font-semibold text-white">
            {inProgress ? 'Resume exam' : 'Start exam'}
          </Text>
          {inProgress && (
            <Text className="mt-1 text-base text-sky-100">
              {formatClock(remainingMs(inProgress.endsAt, state?.loadedAt ?? 0))} left when you
              opened this tab. The timer is still running.
            </Text>
          )}
        </Pressable>

        {failed && (
          <Text className="text-sm text-rose-700 dark:text-rose-400">
            Something went wrong. Try again.
          </Text>
        )}

        {last && last.correctCount !== null && last.totalCount !== null && last.totalCount > 0 && (
          <Pressable
            accessibilityRole="button"
            accessibilityHint="Opens the result of your last mock exam"
            onPress={() =>
              router.push({ pathname: '/exam-results', params: { attemptId: String(last.id) } })
            }
            className="rounded-2xl border border-slate-200 bg-slate-50 p-5 active:opacity-70 dark:border-slate-800 dark:bg-slate-900"
          >
            <Text className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Last result
            </Text>
            <View className="mt-1 flex-row items-baseline gap-2">
              <Text
                maxFontSizeMultiplier={1.4}
                className="text-2xl font-bold text-slate-900 dark:text-slate-50"
              >
                {Math.round((last.correctCount / last.totalCount) * 100)}%
              </Text>
              <Text className="text-base text-slate-600 dark:text-slate-400">
                {last.correctCount} of {last.totalCount} correct
              </Text>
            </View>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
