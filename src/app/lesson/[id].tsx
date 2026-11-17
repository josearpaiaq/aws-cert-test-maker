import * as Haptics from 'expo-haptics';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Linking, Pressable, ScrollView, Text, View, type ScrollViewInstance } from 'react-native';

import { useLessonPlayer } from '@/audio/lesson-player';
import { ListenButton } from '@/components/lessons/listen-button';
import { LessonContent } from '@/components/lessons/lesson-content';
import { LESSON_TIMINGS } from '@/content/lesson-audio';
import { readingMinutes } from '@/content/lesson';
import { getLesson } from '@/content/lessons';
import { CLF_C02 } from '@/data/exams/clf-c02';
import { TASK_TARGET_PREFIX } from '@/data/practice-questions';
import type { Repository } from '@/db/repository';
import { useRepository } from '@/db/use-repository';
import { parseLesson } from '@/logic/lesson-markdown';
import { activeSegment } from '@/logic/lesson-speech';

/** Records the lesson as read now. Kept outside the component so the time is read on demand. */
function recordRead(repo: Repository, lessonId: string): Promise<void> {
  return repo.markLessonRead(CLF_C02.id, lessonId, Date.now());
}

/** Milliseconds since the epoch, read on demand (not during render). */
function now(): number {
  return Date.now();
}

/** After the reader scrolls by hand, the screen stops following the audio for this long. */
const MANUAL_SCROLL_PAUSE_MS = 5000;
/** Where the part being read aloud is placed, in points from the top of the visible area. */
const READ_ALONG_OFFSET = 140;

/** How close to the end, in points, counts as having read the lesson. */
const END_THRESHOLD = 120;

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const repo = useRepository();
  const marked = useRef(false);
  const lesson = getLesson(id);

  const playingId = useLessonPlayer((s) => s.currentId);

  // Read-along: highlight the paragraph being spoken and keep it in view.
  const voice = useLessonPlayer((s) => s.voice);
  const playing = useLessonPlayer((s) => s.playing);
  const currentTime = useLessonPlayer((s) => s.currentTime);
  const scrollRef = useRef<ScrollViewInstance>(null);
  const contentY = useRef(0);
  const positions = useRef(new Map<string, number>());
  const lastManualScroll = useRef(0);
  const timings = LESSON_TIMINGS[voice]?.[id];
  const spoken = playingId === id && timings ? activeSegment(timings, currentTime * 1000) : null;
  const spokenBlock = spoken?.block ?? null;
  const spokenItem = spoken?.item ?? null;

  useEffect(() => {
    if (!playing || spokenBlock === null || spokenBlock < 0) return;
    if (now() - lastManualScroll.current < MANUAL_SCROLL_PAUSE_MS) return;
    const y =
      positions.current.get(`${spokenBlock}:${spokenItem}`) ??
      positions.current.get(`${spokenBlock}:-1`);
    if (y === undefined) return;
    scrollRef.current?.scrollTo({
      y: Math.max(0, contentY.current + y - READ_ALONG_OFFSET),
      animated: true,
    });
  }, [playing, spokenBlock, spokenItem]);

  // Follow the audio: when this lesson was the one playing and the player moves to another
  // lesson (it ended, or next/previous was pressed), show that lesson instead.
  const wasPlayingHere = useRef(false);
  useEffect(() => {
    if (playingId === id) {
      wasPlayingHere.current = true;
    } else if (wasPlayingHere.current && playingId) {
      wasPlayingHere.current = false;
      router.replace({ pathname: '/lesson/[id]', params: { id: playingId } });
    } else {
      wasPlayingHere.current = false;
    }
  }, [playingId, id]);

  if (!lesson) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8 dark:bg-black">
        <Stack.Screen options={{ title: 'Lesson' }} />
        <Text className="text-center text-lg text-slate-900 dark:text-slate-50">
          This lesson is not available yet.
        </Text>
      </View>
    );
  }

  const task = CLF_C02.domains
    .flatMap((domain) => domain.taskStatements)
    .find((t) => t.id === lesson.taskStatement);

  const markRead = () => {
    if (marked.current) return;
    marked.current = true;
    recordRead(repo, lesson.taskStatement).catch(() => {
      marked.current = false;
    });
  };

  return (
    <>
      <Stack.Screen options={{ title: lesson.taskStatement }} />
      <ScrollView
        ref={scrollRef}
        onScrollBeginDrag={() => {
          lastManualScroll.current = now();
        }}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-4 px-5 pb-10 pt-4"
        scrollEventThrottle={200}
        onScroll={({ nativeEvent }) => {
          const { contentOffset, contentSize, layoutMeasurement } = nativeEvent;
          if (contentOffset.y + layoutMeasurement.height >= contentSize.height - END_THRESHOLD) {
            markRead();
          }
        }}
        className="bg-white dark:bg-black"
      >
        <View className="gap-1">
          <Text className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Task {lesson.taskStatement} · {readingMinutes(lesson)} min read
            {lesson.draft ? ' · Draft' : ''}
          </Text>
          <Text
            accessibilityRole="header"
            className="text-3xl font-bold text-slate-900 dark:text-slate-50"
          >
            {lesson.title}
          </Text>
          {task && (
            <Text className="text-base text-slate-600 dark:text-slate-400">{task.title}</Text>
          )}
        </View>

        <ListenButton lessonId={lesson.taskStatement} />

        <View
          onLayout={(event) => {
            contentY.current = event.nativeEvent.layout.y;
          }}
        >
          <LessonContent
            blocks={parseLesson(lesson.body)}
            spoken={spoken}
            onLayout={(block, item, y) => positions.current.set(`${block}:${item}`, y)}
          />
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => {
            void Haptics.selectionAsync();
            markRead();
            router.push({
              pathname: '/practice',
              params: { target: `${TASK_TARGET_PREFIX}${lesson.taskStatement}` },
            });
          }}
          className="mt-4 min-h-14 items-center justify-center rounded-2xl bg-sky-700 px-4 py-3 active:bg-sky-800"
        >
          <Text maxFontSizeMultiplier={1.5} className="text-lg font-semibold text-white">
            Practice this topic
          </Text>
        </Pressable>

        <View className="gap-2">
          <Text className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Sources
          </Text>
          {lesson.sources.map((source) => (
            <Pressable
              key={source.url}
              accessibilityRole="link"
              onPress={() => void Linking.openURL(source.url)}
              className="py-1 active:opacity-60"
            >
              <Text className="text-base text-sky-700 dark:text-sky-400">{source.title}</Text>
            </Pressable>
          ))}
          <Text className="text-sm leading-5 text-slate-500 dark:text-slate-400">
            Written in our own words from the AWS documentation linked above.
          </Text>
        </View>
      </ScrollView>
    </>
  );
}
