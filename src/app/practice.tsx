import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { QuestionCard } from '@/components/practice/question-card';
import { CLF_C02 } from '@/data/exams/clf-c02';
import { loadPracticeQuestions } from '@/data/practice-questions';
import { recordAnswer } from '@/db/record-answer';
import { useRepository } from '@/db/use-repository';
import { canCheck, usePracticeSession } from '@/state/practice-session';

type LoadStatus = 'loading' | 'ready' | 'error';

function PrimaryButton(props: { label: string; disabled?: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: props.disabled }}
      disabled={props.disabled}
      onPress={props.onPress}
      className={`h-14 flex-1 items-center justify-center rounded-2xl bg-sky-600 active:bg-sky-700 ${
        props.disabled ? 'opacity-40' : ''
      }`}
    >
      <Text className="text-lg font-semibold text-white">{props.label}</Text>
    </Pressable>
  );
}

function CenteredMessage(props: { title: string; body?: string; children?: React.ReactNode }) {
  return (
    <View className="flex-1 items-center justify-center gap-3 px-8">
      <Text className="text-center text-2xl font-bold text-slate-900 dark:text-slate-50">
        {props.title}
      </Text>
      {props.body && (
        <Text className="text-center text-base text-slate-600 dark:text-slate-400">
          {props.body}
        </Text>
      )}
      {props.children}
    </View>
  );
}

export default function PracticeScreen() {
  const { target } = useLocalSearchParams<{ target: string }>();
  const repo = useRepository();
  const { width } = useWindowDimensions();

  const questions = usePracticeSession((s) => s.questions);
  const index = usePracticeSession((s) => s.index);
  const selected = usePracticeSession((s) => s.selected);
  const unsure = usePracticeSession((s) => s.unsure);
  const revealed = usePracticeSession((s) => s.revealed);
  const results = usePracticeSession((s) => s.results);
  const start = usePracticeSession((s) => s.start);
  const toggleOption = usePracticeSession((s) => s.toggleOption);
  const toggleUnsure = usePracticeSession((s) => s.toggleUnsure);
  const reveal = usePracticeSession((s) => s.reveal);
  const next = usePracticeSession((s) => s.next);

  const [status, setStatus] = useState<LoadStatus>('loading');
  const [round, setRound] = useState(0);
  const [saveFailed, setSaveFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadPracticeQuestions(repo, target)
      .then((loaded) => {
        if (cancelled) return;
        start(loaded);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [repo, target, round, start]);

  // Card position and progress live in shared values so the animations run on the UI thread.
  const translateX = useSharedValue(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    translateX.set(width * 0.4);
    translateX.set(withTiming(0, { duration: 220 }));
  }, [index, round, translateX, width]);

  const total = questions.length;
  useEffect(() => {
    progress.set(withTiming(total === 0 ? 0 : (index + (revealed ? 1 : 0)) / total));
  }, [index, revealed, total, progress]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.get() }],
    opacity: 1 - Math.min(Math.abs(translateX.get()) / width, 1) * 0.6,
  }));
  const progressStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: progress.get() }] }));

  const slideToNext = () => {
    translateX.set(
      withTiming(-width, { duration: 180 }, (finished) => {
        if (finished) scheduleOnRN(next);
      }),
    );
  };

  const swipe = usePanGesture({
    enabled: revealed,
    activeOffsetX: [-20, 20],
    failOffsetY: [-15, 15],
    onUpdate: (event) => {
      'worklet';
      translateX.set(Math.min(0, event.translationX));
    },
    onDeactivate: (event) => {
      'worklet';
      if (event.translationX < -width * 0.25 || event.velocityX < -800) {
        translateX.set(
          withTiming(-width, { duration: 160 }, (finished) => {
            if (finished) scheduleOnRN(next);
          }),
        );
      } else {
        translateX.set(withSpring(0));
      }
    },
  });

  const question = questions[index];

  const onToggleOption = (optionId: string) => {
    void Haptics.selectionAsync();
    toggleOption(optionId);
  };

  const onCheck = () => {
    const result = reveal();
    if (!result) return;

    void Haptics.notificationAsync(
      result.isCorrect
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Error,
    );
    if (!result.isCorrect) {
      translateX.set(
        withSequence(
          withTiming(-10, { duration: 50 }),
          withTiming(10, { duration: 50 }),
          withTiming(-6, { duration: 50 }),
          withTiming(0, { duration: 50 }),
        ),
      );
    }

    recordAnswer(repo, {
      examId: CLF_C02.id,
      questionId: result.question.id,
      domain: result.question.domain,
      mode: 'practice',
      selected: result.selected,
      isCorrect: result.isCorrect,
      confidence: result.confidence,
      now: Date.now(),
    }).catch(() => setSaveFailed(true));
  };

  const close = () => router.back();
  const restart = () => {
    setStatus('loading');
    setSaveFailed(false);
    setRound((r) => r + 1);
  };

  let content: React.ReactNode;
  if (status === 'loading') {
    content = (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" accessibilityLabel="Loading questions" />
      </View>
    );
  } else if (status === 'error') {
    content = (
      <CenteredMessage
        title="Couldn't start practice"
        body="Something went wrong loading questions."
      >
        <View className="mt-4 flex-row">
          <PrimaryButton label="Try again" onPress={restart} />
        </View>
      </CenteredMessage>
    );
  } else if (total === 0) {
    content = (
      <CenteredMessage title="No questions yet" body="There are no questions for this selection." />
    );
  } else if (!question) {
    const correct = results.filter((r) => r.isCorrect).length;
    content = (
      <CenteredMessage
        title="Session complete"
        body={`You answered ${correct} of ${total} correctly.`}
      >
        <View className="mt-4 flex-row">
          <PrimaryButton label="Practice again" onPress={restart} />
        </View>
        <Pressable accessibilityRole="button" onPress={close} className="p-3 active:opacity-60">
          <Text className="text-base font-medium text-sky-700 dark:text-sky-400">Done</Text>
        </Pressable>
      </CenteredMessage>
    );
  } else {
    const isLast = index === total - 1;
    const wasCorrect = results[results.length - 1]?.isCorrect ?? false;
    content = (
      <>
        <GestureDetector gesture={swipe}>
          <Animated.View style={[{ flex: 1 }, cardStyle]}>
            <ScrollView contentContainerClassName="px-5 pb-6 pt-2">
              <QuestionCard
                question={question}
                selected={selected}
                revealed={revealed}
                wasCorrect={wasCorrect}
                onToggleOption={onToggleOption}
              />
              {saveFailed && (
                <Text className="mt-3 text-sm text-rose-700 dark:text-rose-400">
                  This answer could not be saved to your progress.
                </Text>
              )}
            </ScrollView>
          </Animated.View>
        </GestureDetector>

        <View className="gap-2 border-t border-slate-200 px-5 pb-2 pt-3 dark:border-slate-800">
          {revealed ? (
            <>
              <View className="flex-row">
                <PrimaryButton label={isLast ? 'Finish' : 'Next'} onPress={slideToNext} />
              </View>
              <Text className="text-center text-sm text-slate-500 dark:text-slate-400">
                or swipe left
              </Text>
            </>
          ) : (
            <View className="flex-row items-center gap-3">
              <Pressable
                accessibilityRole="switch"
                accessibilityState={{ checked: unsure }}
                accessibilityLabel="Not sure"
                accessibilityHint="Marks this answer as a guess so the question comes back for review"
                onPress={() => {
                  void Haptics.selectionAsync();
                  toggleUnsure();
                }}
                className={`h-14 items-center justify-center rounded-2xl border-2 px-4 active:opacity-70 ${
                  unsure
                    ? 'border-amber-500 bg-amber-50 dark:border-amber-400 dark:bg-amber-950'
                    : 'border-slate-300 dark:border-slate-700'
                }`}
              >
                <Text className="text-base font-medium text-slate-800 dark:text-slate-100">
                  Not sure
                </Text>
              </Pressable>
              <PrimaryButton
                label="Check answer"
                disabled={!canCheck(question, selected)}
                onPress={onCheck}
              />
            </View>
          )}
        </View>
      </>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <View className="flex-row items-center gap-4 px-5 py-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="End practice session"
          hitSlop={12}
          onPress={close}
          className="active:opacity-60"
        >
          <Text className="text-2xl text-slate-600 dark:text-slate-300">✕</Text>
        </Pressable>
        <View
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: total, now: Math.min(index + 1, total) }}
          className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
        >
          <Animated.View
            style={[{ flex: 1, transformOrigin: 'left' }, progressStyle]}
            className="rounded-full bg-sky-500"
          />
        </View>
        {status === 'ready' && question && (
          <Text className="min-w-12 text-right text-sm font-medium text-slate-600 dark:text-slate-300">
            {index + 1} / {total}
          </Text>
        )}
      </View>
      {content}
    </SafeAreaView>
  );
}
