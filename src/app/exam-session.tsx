import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { router, usePreventRemove } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ExamTimer } from '@/components/exam/exam-timer';
import { QuestionGrid } from '@/components/exam/question-grid';
import { QuestionCard } from '@/components/practice/question-card';
import { CLF_C02 } from '@/data/exams/clf-c02';
import { getQuestionBank } from '@/data/question-bank';
import { questionsForAttempt, submitExam } from '@/db/exam-attempts';
import { useRepository } from '@/db/use-repository';
import { countAnswered, useExamSession } from '@/state/exam-session';

type Status = 'loading' | 'ready' | 'submitting' | 'error';

function FooterButton(props: {
  label: string;
  primary?: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: props.disabled }}
      disabled={props.disabled}
      onPress={props.onPress}
      className={`min-h-14 flex-1 items-center justify-center rounded-2xl py-3 active:opacity-70 ${
        props.primary ? 'bg-sky-700' : 'border-2 border-slate-300 dark:border-slate-700'
      } ${props.disabled ? 'opacity-40' : ''}`}
    >
      <Text
        maxFontSizeMultiplier={1.5}
        className={`text-center text-lg font-semibold ${
          props.primary ? 'text-white' : 'text-slate-800 dark:text-slate-100'
        }`}
      >
        {props.label}
      </Text>
    </Pressable>
  );
}

export default function ExamSessionScreen() {
  useKeepAwake();
  const repo = useRepository();

  const attempt = useExamSession((s) => s.attempt);
  const questions = useExamSession((s) => s.questions);
  const index = useExamSession((s) => s.index);
  const responses = useExamSession((s) => s.responses);
  const flagged = useExamSession((s) => s.flagged);
  const load = useExamSession((s) => s.load);
  const toggleOption = useExamSession((s) => s.toggleOption);
  const toggleFlag = useExamSession((s) => s.toggleFlag);
  const goTo = useExamSession((s) => s.goTo);

  const [status, setStatus] = useState<Status>('loading');
  const [showGrid, setShowGrid] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const submitted = useRef(false);

  // Always start from the stored attempt, so the exam resumes after the app is killed.
  useEffect(() => {
    let cancelled = false;
    repo
      .getInProgressExamAttempt(CLF_C02.id)
      .then((stored) => {
        if (cancelled) return;
        if (!stored) {
          setLeaving(true);
          router.back();
          return;
        }
        load(stored, questionsForAttempt(stored, getQuestionBank()));
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [repo, load]);

  // Leaving by the Android back button, the close button or a gesture asks first.
  const disablePrevention = usePreventRemove(status === 'ready' && !leaving, ({ repeat }) => {
    Alert.alert('Leave the exam?', 'Your answers are saved and the timer keeps running.', [
      { text: 'Stay', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: () => {
          setLeaving(true);
          repeat();
        },
      },
    ]);
  });

  const persist = () => {
    const state = useExamSession.getState();
    if (!state.attempt) return;
    repo
      .saveExamProgress(state.attempt.id, { responses: state.responses, flagged: state.flagged })
      .catch(() => setSaveFailed(true));
  };

  const submit = useCallback(async () => {
    const state = useExamSession.getState();
    if (!state.attempt || submitted.current) return;
    submitted.current = true;
    setStatus('submitting');
    try {
      const latest = { ...state.attempt, responses: state.responses, flagged: state.flagged };
      await submitExam(repo, latest, getQuestionBank(), Date.now());
      disablePrevention();
      router.replace({ pathname: '/exam-results', params: { attemptId: String(latest.id) } });
    } catch {
      submitted.current = false;
      setStatus('error');
    }
  }, [repo, disablePrevention]);

  const confirmSubmit = () => {
    const unanswered = questions.length - countAnswered(questions, responses);
    Alert.alert(
      'Submit exam?',
      unanswered > 0
        ? `${unanswered} ${unanswered === 1 ? 'question is' : 'questions are'} unanswered and will count as incorrect.`
        : 'You have answered every question.',
      [
        { text: 'Keep working', style: 'cancel' },
        { text: 'Submit', onPress: () => void submit() },
      ],
    );
  };

  if (status === 'loading' || status === 'submitting' || !attempt) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center gap-4 bg-white dark:bg-black">
        {status === 'error' ? (
          <Text className="px-8 text-center text-lg text-slate-900 dark:text-slate-50">
            The exam could not be loaded.
          </Text>
        ) : (
          <>
            <ActivityIndicator size="large" />
            <Text className="text-base text-slate-600 dark:text-slate-400">
              {status === 'submitting' ? 'Scoring your exam…' : 'Loading exam…'}
            </Text>
          </>
        )}
      </SafeAreaView>
    );
  }

  const question = questions[index];
  const total = questions.length;
  const isFlagged = question ? flagged.includes(question.id) : false;

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <View className="flex-row items-center justify-between px-5 py-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Leave exam"
          hitSlop={12}
          onPress={() => router.back()}
          className="active:opacity-60"
        >
          <Text maxFontSizeMultiplier={1.4} className="text-2xl text-slate-600 dark:text-slate-300">
            ✕
          </Text>
        </Pressable>
        <ExamTimer endsAt={attempt.endsAt} onExpire={submit} />
        <Pressable
          accessibilityRole="button"
          hitSlop={12}
          onPress={() => setShowGrid((shown) => !shown)}
          className="active:opacity-60"
        >
          <Text className="text-base font-semibold text-sky-700 dark:text-sky-400">
            {showGrid ? 'Question' : 'Review'}
          </Text>
        </Pressable>
      </View>

      {status === 'error' && (
        <Text className="px-5 pb-2 text-sm text-rose-700 dark:text-rose-400">
          The exam could not be submitted. Try again.
        </Text>
      )}
      {saveFailed && (
        <Text className="px-5 pb-2 text-sm text-rose-700 dark:text-rose-400">
          Your latest answer could not be saved.
        </Text>
      )}

      {showGrid || !question ? (
        <>
          <ScrollView contentContainerClassName="gap-4 px-5 pb-6 pt-2">
            <Text
              maxFontSizeMultiplier={1.6}
              accessibilityRole="header"
              className="text-xl font-semibold text-slate-900 dark:text-slate-50"
            >
              {countAnswered(questions, responses)} of {total} answered · {flagged.length} flagged
            </Text>
            <QuestionGrid
              questions={questions}
              responses={responses}
              flagged={flagged}
              currentIndex={index}
              onSelect={(target) => {
                goTo(target);
                setShowGrid(false);
              }}
            />
          </ScrollView>
          <View className="flex-row border-t border-slate-200 px-5 pb-2 pt-3 dark:border-slate-800">
            <FooterButton label="Submit exam" primary onPress={confirmSubmit} />
          </View>
        </>
      ) : (
        <>
          <View className="flex-row items-center justify-between px-5 pb-2">
            <Text className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Question {index + 1} of {total}
            </Text>
            <Pressable
              accessibilityRole="switch"
              accessibilityState={{ checked: isFlagged }}
              accessibilityLabel="Flag for review"
              testID="flag-question"
              hitSlop={8}
              onPress={() => {
                void Haptics.selectionAsync();
                toggleFlag();
                persist();
              }}
              className={`rounded-full border-2 px-3 py-1 active:opacity-70 ${
                isFlagged
                  ? 'border-amber-500 bg-amber-50 dark:border-amber-400 dark:bg-amber-950'
                  : 'border-slate-300 dark:border-slate-700'
              }`}
            >
              <Text className="text-sm font-medium text-slate-800 dark:text-slate-100">
                {isFlagged ? 'Flagged' : 'Flag'}
              </Text>
            </Pressable>
          </View>

          <ScrollView key={question.id} contentContainerClassName="px-5 pb-6 pt-2">
            <QuestionCard
              question={question}
              selected={responses[question.id] ?? []}
              revealed={false}
              wasCorrect={false}
              // Tied to the attempt, so a resumed exam shows the options in the same order.
              optionSeed={`exam-${attempt.id}:${question.id}`}
              onToggleOption={(optionId) => {
                void Haptics.selectionAsync();
                toggleOption(optionId);
                persist();
              }}
            />
          </ScrollView>

          <View className="flex-row gap-3 border-t border-slate-200 px-5 pb-2 pt-3 dark:border-slate-800">
            <FooterButton label="Previous" disabled={index === 0} onPress={() => goTo(index - 1)} />
            {index === total - 1 ? (
              <FooterButton label="Review" primary onPress={() => setShowGrid(true)} />
            ) : (
              <FooterButton label="Next" primary onPress={() => goTo(index + 1)} />
            )}
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
