import { SymbolView } from 'expo-symbols';
import { Pressable, Text, useColorScheme } from 'react-native';

import { playLesson, useLessonPlayer } from '@/audio/lesson-player';
import { LESSON_AUDIO } from '@/content/lesson-audio';

/**
 * "Listen to this lesson", shown on a lesson that has audio and is not the one playing. Once it
 * plays, the app-wide mini player takes over the controls.
 */
export function ListenButton({ lessonId }: { lessonId: string }) {
  const voice = useLessonPlayer((s) => s.voice);
  const currentId = useLessonPlayer((s) => s.currentId);
  const color = useColorScheme() === 'dark' ? '#f8fafc' : '#0f172a';

  if (currentId === lessonId || !(lessonId in LESSON_AUDIO[voice])) return null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint="Plays this lesson as audio. It keeps playing with the screen locked."
      onPress={() => void playLesson(lessonId)}
      className="flex-row items-center justify-center gap-2 rounded-2xl border-2 border-sky-700 px-4 py-3 active:opacity-70 dark:border-sky-400"
    >
      <SymbolView name={{ ios: 'headphones', android: 'headphones' }} size={22} tintColor={color} />
      <Text
        maxFontSizeMultiplier={1.5}
        className="text-base font-semibold text-slate-900 dark:text-slate-50"
      >
        Listen to this lesson
      </Text>
    </Pressable>
  );
}
