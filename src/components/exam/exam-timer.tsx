import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { AppState, Platform, Pressable, Text, useColorScheme, type TextStyle } from 'react-native';

import { formatClock, remainingMs } from '@/logic/exam-clock';

type ExamTimerProps = {
  /** When the exam ends, in epoch milliseconds. */
  endsAt: number;
  onExpire: () => void;
};

const LOW_TIME_MS = 5 * 60 * 1000;

/** Shown, blurred, instead of the real time while the timer is hidden, so nothing ticks. */
const HIDDEN_PLACEHOLDER = '00:00';

/**
 * A blurred look for the hidden placeholder. Android 12+ applies a real blur filter. React Native
 * has no blur filter on iOS, so the text is faded and given a soft glow instead.
 */
function blurred(color: string): TextStyle {
  return Platform.OS === 'android'
    ? { color, filter: [{ blur: 6 }] }
    : {
        color,
        opacity: 0.25,
        textShadowColor: color,
        textShadowRadius: 6,
        textShadowOffset: { width: 0, height: 0 },
      };
}

export function ExamTimer({ endsAt, onExpire }: ExamTimerProps) {
  const [now, setNow] = useState(() => Date.now());
  const [hidden, setHidden] = useState(false);
  const dark = useColorScheme() === 'dark';

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const interval = setInterval(tick, 1000);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') tick();
    });
    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, []);

  const remaining = remainingMs(endsAt, now);
  const expired = remaining === 0;

  useEffect(() => {
    if (expired) onExpire();
  }, [expired, onExpire]);

  const low = !hidden && remaining <= LOW_TIME_MS;
  const color = low ? (dark ? '#fb7185' : '#e11d48') : dark ? '#f8fafc' : '#0f172a';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={hidden ? 'Timer hidden' : `${Math.ceil(remaining / 60000)} minutes left`}
      accessibilityHint={hidden ? 'Shows the time left' : 'Hides the time left'}
      testID="exam-timer"
      hitSlop={8}
      onPress={() => setHidden((value) => !value)}
      className="min-w-28 flex-row items-center justify-center gap-2 rounded-full px-3 py-1 active:opacity-60"
    >
      <SymbolView
        name={{
          ios: hidden ? 'eye.slash' : 'eye',
          android: hidden ? 'visibility_off' : 'visibility',
        }}
        size={20}
        tintColor={color}
      />
      <Text
        maxFontSizeMultiplier={1.4}
        style={hidden ? blurred(color) : { color }}
        className="text-lg font-semibold tabular-nums"
      >
        {hidden ? HIDDEN_PLACEHOLDER : formatClock(remaining)}
      </Text>
    </Pressable>
  );
}
