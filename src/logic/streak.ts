import { DAY_MS, dayKey, daysAgo, startOfDay } from '@/logic/dates';

/** Consecutive study days that earn one streak freeze. */
export const FREEZE_EARN_DAYS = 7;
/** The most freezes that can be banked at once. */
export const MAX_FREEZES = 2;
/** How many days the week strip shows, ending today. */
export const WEEK_DAYS = 7;

/** `pending` is today before any study: the streak is not lost until the day ends. */
export type DayState = 'studied' | 'frozen' | 'missed' | 'pending';

export type Streak = {
  /** Consecutive days with study activity, ending today or yesterday. Frozen days bridge gaps. */
  current: number;
  studiedToday: boolean;
  /** The longest streak ever reached. */
  best: number;
  /** Freezes banked. Each one saves the streak on a missed day, used automatically. */
  freezes: number;
  /** Study days left to earn the next freeze, or null when the bank is full. */
  daysToNextFreeze: number | null;
  /** The last WEEK_DAYS days, oldest first, ending today. */
  week: { day: string; state: DayState }[];
};

/**
 * The study streak from the timestamps of every study activity (answers and lesson reads). A streak stays alive through today
 * even if nothing has been answered yet today: it only breaks once a whole day is missed. Every
 * FREEZE_EARN_DAYS study days earn a freeze (up to MAX_FREEZES), and a missed day uses one up
 * instead of breaking the streak. Everything is derived from the history, so nothing is stored.
 */
export function computeStreak(activityTimestamps: readonly number[], now: number): Streak {
  const days = new Set(activityTimestamps.map(dayKey));
  const todayKey = dayKey(now);
  const studiedToday = days.has(todayKey);

  const first = activityTimestamps.reduce((min, t) => Math.min(min, t), now);
  // Rounded because a daylight-saving change makes one day 23 or 25 hours long.
  const span = Math.max(0, Math.round((startOfDay(now) - startOfDay(first)) / DAY_MS));

  let current = 0;
  let best = 0;
  let freezes = 0;
  let earnProgress = 0;
  const states = new Map<string, DayState>();

  for (let offset = span; offset >= 0; offset--) {
    const key = dayKey(daysAgo(now, offset));
    if (days.has(key)) {
      states.set(key, 'studied');
      current += 1;
      best = Math.max(best, current);
      if (freezes < MAX_FREEZES && ++earnProgress === FREEZE_EARN_DAYS) {
        freezes += 1;
        earnProgress = 0;
      }
    } else if (key === todayKey) {
      states.set(key, 'pending');
    } else if (current > 0 && freezes > 0) {
      states.set(key, 'frozen');
      freezes -= 1;
    } else {
      states.set(key, 'missed');
      current = 0;
      earnProgress = 0;
    }
  }

  const week = Array.from({ length: WEEK_DAYS }, (_, i) => {
    const day = dayKey(daysAgo(now, WEEK_DAYS - 1 - i));
    return { day, state: states.get(day) ?? (day === todayKey ? 'pending' : 'missed') };
  });

  return {
    current,
    studiedToday,
    best,
    freezes,
    daysToNextFreeze: freezes >= MAX_FREEZES ? null : FREEZE_EARN_DAYS - earnProgress,
    week,
  };
}
