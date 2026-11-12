import { dayKey, daysAgo } from '@/logic/dates';

export type Streak = {
  /** Consecutive days with at least one answer, ending today or yesterday. */
  current: number;
  studiedToday: boolean;
};

/**
 * The study streak from the timestamps of every answer. A streak stays alive through today
 * even if nothing has been answered yet today: it only breaks once a whole day is missed.
 */
export function computeStreak(answerTimestamps: readonly number[], now: number): Streak {
  const days = new Set(answerTimestamps.map(dayKey));
  const studiedToday = days.has(dayKey(now));

  let current = 0;
  for (let offset = studiedToday ? 0 : 1; days.has(dayKey(daysAgo(now, offset))); offset++) {
    current += 1;
  }
  return { current, studiedToday };
}
