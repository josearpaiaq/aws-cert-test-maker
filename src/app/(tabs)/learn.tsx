import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { readingMinutes } from '@/content/lesson';
import { getLesson, LESSONS } from '@/content/lessons';
import { CLF_C02 } from '@/data/exams/clf-c02';
import { useRepository } from '@/db/use-repository';

export default function LearnScreen() {
  const repo = useRepository();
  const [read, setRead] = useState<string[]>([]);

  // Refresh on focus so a lesson just finished shows as read.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      repo
        .getReadLessonIds(CLF_C02.id)
        .then((ids) => {
          if (!cancelled) setRead(ids);
        })
        .catch(() => undefined);
      return () => {
        cancelled = true;
      };
    }, [repo]),
  );

  const readCount = LESSONS.filter((lesson) => read.includes(lesson.taskStatement)).length;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white dark:bg-black">
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-3 px-5 pb-8 pt-4"
      >
        <Text
          accessibilityRole="header"
          className="text-3xl font-bold text-slate-900 dark:text-slate-50"
        >
          Learn
        </Text>
        <Text className="text-base text-slate-600 dark:text-slate-400">
          One lesson per exam topic · {readCount} of {LESSONS.length} read
        </Text>

        {CLF_C02.domains.map((domain) => (
          <View key={domain.id} className="mt-4 gap-3">
            <Text
              accessibilityRole="header"
              className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Domain {domain.id} · {domain.name}
            </Text>
            {domain.taskStatements.map((task) => {
              const lesson = getLesson(task.id);
              const isRead = read.includes(task.id);
              if (!lesson) {
                return (
                  <View
                    key={task.id}
                    accessible
                    accessibilityLabel={`${task.id}, ${task.title} Lesson coming soon.`}
                    className="rounded-2xl border border-dashed border-slate-300 p-4 dark:border-slate-700"
                  >
                    <Text className="text-sm text-slate-500 dark:text-slate-400">
                      {task.id} · Coming soon
                    </Text>
                    <Text className="mt-1 text-base text-slate-500 dark:text-slate-400">
                      {task.title}
                    </Text>
                  </View>
                );
              }
              return (
                <Pressable
                  key={task.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${task.id}, ${lesson.title}. ${readingMinutes(lesson)} minute read${isRead ? ', read' : ''}`}
                  onPress={() => router.push({ pathname: '/lesson/[id]', params: { id: task.id } })}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 active:opacity-70 dark:border-slate-800 dark:bg-slate-900"
                >
                  <Text className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {task.id} · {readingMinutes(lesson)} min{isRead ? ' · ✓ Read' : ''}
                  </Text>
                  <Text className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">
                    {lesson.title}
                  </Text>
                  <Text className="mt-1 text-sm leading-5 text-slate-600 dark:text-slate-400">
                    {lesson.summary}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
