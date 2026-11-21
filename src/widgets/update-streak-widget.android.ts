import { dayKey } from '@/logic/dates';
import type { Streak } from '@/logic/streak';
import StreakWidget from '@/widgets/streak-widget';

/** Pushes the current streak to the home-screen widget. */
export function updateStreakWidget(streak: Streak, now: number): void {
  StreakWidget.updateSnapshot({
    current: streak.current,
    lastStudiedDay: streak.studiedToday ? dayKey(now) : '',
  });
}
