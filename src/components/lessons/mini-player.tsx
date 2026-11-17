import { SymbolView } from 'expo-symbols';
import { router, usePathname } from 'expo-router';
import { useEffect } from 'react';
import { Platform, Pressable, Text, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  nextLesson,
  previousLesson,
  stopPlayback,
  togglePlayback,
  useLessonPlayer,
} from '@/audio/lesson-player';
import { SeekBar } from '@/components/lessons/seek-bar';
import { VOICE_NAMES } from '@/content/lesson-audio';
import { getLesson } from '@/content/lessons';

/** Routes of the tab screens, where Android's tab bar sits under the content. */
const TAB_ROUTES = new Set(['/', '/learn', '/exam', '/progress']);
/** Height of Android's Material 3 navigation bar (the tab bar), without the system inset. */
const ANDROID_TAB_BAR_HEIGHT = 80;

/**
 * Extra bottom padding a tab screen needs so its last items are not hidden behind the mini
 * player when it floats above Android's tab bar.
 */
export function useMiniPlayerPadding(): number {
  return useLessonPlayer((s) => s.overlayHeight);
}

type SymbolName = React.ComponentProps<typeof SymbolView>['name'];

function IconButton(props: {
  label: string;
  name: SymbolName;
  size?: number;
  onPress: () => void;
}) {
  const color = useColorScheme() === 'dark' ? '#f8fafc' : '#0f172a';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={props.label}
      hitSlop={6}
      onPress={props.onPress}
      className="h-11 w-10 items-center justify-center active:opacity-60"
    >
      <SymbolView name={props.name} size={props.size ?? 22} tintColor={color} />
    </Pressable>
  );
}

/**
 * The audio player for the whole app. It is docked under every screen while a lesson is loaded,
 * so playback can be paused from anywhere. Tapping the title opens the lesson being played.
 */
export function MiniPlayer() {
  const voice = useLessonPlayer((s) => s.voice);
  const currentId = useLessonPlayer((s) => s.currentId);
  const playing = useLessonPlayer((s) => s.playing);
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  // Android's tab bar always pads itself for the system navigation bar, so placing the player
  // under it makes the tab bar look too tall. On tab screens it floats above the tab bar instead.
  const floating = Platform.OS === 'android' && TAB_ROUTES.has(pathname);
  useEffect(() => {
    if (!currentId || !floating) useLessonPlayer.setState({ overlayHeight: 0 });
  }, [currentId, floating]);

  if (!currentId) return null;
  const lesson = getLesson(currentId);
  const lessonPath = `/lesson/${currentId}`;

  const openLesson = () => {
    if (pathname === lessonPath) return;
    // From another lesson, swap screens instead of stacking lesson on lesson.
    const target = { pathname: '/lesson/[id]', params: { id: currentId } } as const;
    if (pathname.startsWith('/lesson/')) router.replace(target);
    else router.push(target);
  };

  return (
    <View
      onLayout={(event) => {
        if (floating) useLessonPlayer.setState({ overlayHeight: event.nativeEvent.layout.height });
      }}
      style={
        floating
          ? {
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: ANDROID_TAB_BAR_HEIGHT + insets.bottom,
            }
          : { paddingBottom: insets.bottom }
      }
      className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
    >
      <View className="px-4 pt-2">
        <SeekBar />
      </View>
      <View className="flex-row items-center gap-1 px-4 pb-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Now playing: ${currentId}, ${lesson?.title ?? ''}`}
          accessibilityHint="Opens this lesson"
          onPress={openLesson}
          className="flex-1 active:opacity-60"
        >
          <Text
            numberOfLines={1}
            maxFontSizeMultiplier={1.4}
            className="text-base font-semibold text-slate-900 dark:text-slate-50"
          >
            {currentId} · {lesson?.title}
          </Text>
          <Text
            numberOfLines={1}
            maxFontSizeMultiplier={1.4}
            className="text-xs text-slate-600 dark:text-slate-400"
          >
            {VOICE_NAMES[voice]}, AI voice
          </Text>
        </Pressable>
        <IconButton
          label="Previous lesson"
          name={{ ios: 'backward.end.fill', android: 'skip_previous' }}
          onPress={previousLesson}
        />
        <IconButton
          label={playing ? 'Pause' : 'Play'}
          name={
            playing
              ? { ios: 'pause.fill', android: 'pause' }
              : { ios: 'play.fill', android: 'play_arrow' }
          }
          size={28}
          onPress={togglePlayback}
        />
        <IconButton
          label="Next lesson"
          name={{ ios: 'forward.end.fill', android: 'skip_next' }}
          onPress={nextLesson}
        />
        <IconButton
          label="Stop and close the player"
          name={{ ios: 'xmark', android: 'close' }}
          size={16}
          onPress={stopPlayback}
        />
      </View>
    </View>
  );
}
