import { useEffect, useState } from 'react';
import { AppState, Text } from 'react-native';

import { formatClock, remainingMs } from '@/logic/exam-clock';

type ExamTimerProps = {
  /** When the exam ends, in epoch milliseconds. */
  endsAt: number;
  onExpire: () => void;
};

/**
 * Countdown for the mock exam. The time left is always computed from `endsAt` and the
 * current clock, never by counting ticks, so it stays right after the app has been in the
 * background (where JavaScript timers are paused).
 */
export function ExamTimer({ endsAt, onExpire }: ExamTimerProps) {
  const [now, setNow] = useState(() => Date.now());

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

  const low = remaining <= 5 * 60 * 1000;
  return (
    <Text
      accessibilityRole="timer"
      accessibilityLabel={`${Math.ceil(remaining / 60000)} minutes left`}
      className={`text-lg font-semibold tabular-nums ${
        low ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-50'
      }`}
    >
      {formatClock(remaining)}
    </Text>
  );
}
