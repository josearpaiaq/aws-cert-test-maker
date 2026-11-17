import { useState } from 'react';
import { Text, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';

import { seekTo, useLessonPlayer } from '@/audio/lesson-player';
import { positionFromTouch, stepPosition } from '@/logic/seek';

/** Seconds moved by the screen reader's swipe up/down on the seek bar. */
const ACCESSIBILITY_STEP = 15;

function clock(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

/**
 * A seek bar for the lesson being played. Tap a point or drag along it; the position is applied
 * when the finger lifts, and the time shows where you will land while dragging.
 */
export function SeekBar() {
  const currentTime = useLessonPlayer((s) => s.currentTime);
  const duration = useLessonPlayer((s) => s.duration);
  const [width, setWidth] = useState(0);
  const [dragging, setDragging] = useState<number | null>(null);

  const shown = dragging ?? currentTime;
  const fraction = duration > 0 ? Math.min(1, shown / duration) : 0;

  const pan = usePanGesture({
    // A short control: handling it on the JS thread keeps the code simple.
    runOnJS: true,
    minDistance: 0,
    onBegin: (event) => setDragging(positionFromTouch(event.x, width, duration)),
    onUpdate: (event) => setDragging(positionFromTouch(event.x, width, duration)),
    onFinalize: (event) => {
      if (!event.canceled) seekTo(positionFromTouch(event.x, width, duration));
      setDragging(null);
    },
  });

  return (
    <View className="gap-1">
      <GestureDetector gesture={pan}>
        <View
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel="Playback position"
          accessibilityValue={{ text: `${clock(shown)} of ${clock(duration)}` }}
          accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
          onAccessibilityAction={({ nativeEvent }) => {
            const step =
              nativeEvent.actionName === 'increment' ? ACCESSIBILITY_STEP : -ACCESSIBILITY_STEP;
            seekTo(stepPosition(currentTime, step, duration));
          }}
          hitSlop={{ top: 12, bottom: 12 }}
          onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
          className="h-5 justify-center"
        >
          <View className="h-1.5 overflow-hidden rounded-full bg-slate-300 dark:bg-slate-700">
            <View
              style={{ width: `${fraction * 100}%` }}
              className="h-1.5 rounded-full bg-sky-600 dark:bg-sky-400"
            />
          </View>
          <View
            pointerEvents="none"
            style={{ left: `${fraction * 100}%` }}
            className={`absolute -ml-2 h-4 w-4 rounded-full bg-sky-600 dark:bg-sky-400 ${dragging === null ? '' : 'scale-125'}`}
          />
        </View>
      </GestureDetector>
      <View className="flex-row justify-between">
        <Text
          maxFontSizeMultiplier={1.3}
          className="text-xs tabular-nums text-slate-600 dark:text-slate-400"
        >
          {clock(shown)}
        </Text>
        <Text
          maxFontSizeMultiplier={1.3}
          className="text-xs tabular-nums text-slate-600 dark:text-slate-400"
        >
          {clock(duration)}
        </Text>
      </View>
    </View>
  );
}
