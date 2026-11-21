import { daysAgo } from '@/logic/dates';
import type { ReminderTime } from '@/logic/reminder-time';
import type { Streak } from '@/logic/streak';

/**
 * How many days ahead reminders are scheduled. They are one-off notifications so each can carry
 * the streak at stake; this many keep reminding a learner who stops opening the app.
 */
export const REMINDER_DAYS = 7;

export type PlannedReminder = { at: number; title: string; body: string };

const GENERIC = {
  title: 'Time to study',
  body: 'Open CloudPrep to review the questions due today.',
};

/**
 * The reminders to schedule from now on, one per day at `time`. Today's is skipped once the
 * learner has studied. The first one names the streak at stake when it is still alive then.
 */
export function planReminders(time: ReminderTime, streak: Streak, now: number): PlannedReminder[] {
  const plan: PlannedReminder[] = [];
  for (let day = 0; plan.length < REMINDER_DAYS; day++) {
    const at = new Date(daysAgo(now, -day));
    at.setHours(time.hour, time.minute, 0, 0);
    if (at.getTime() <= now || (day === 0 && streak.studiedToday)) continue;

    let text = GENERIC;
    if (plan.length === 0 && streak.current > 0) {
      if (day === 0) {
        text = {
          title: `🔥 Your ${streak.current}-day streak ends tonight`,
          body:
            streak.freezes > 0
              ? 'A freeze would save it, but a few questions keep it going for real.'
              : 'Answer a few questions to keep it alive.',
        };
      } else if (day === 1 && streak.studiedToday) {
        text = {
          title: `🔥 Keep your ${streak.current}-day streak going`,
          body: `A few questions today make it ${streak.current + 1} days.`,
        };
      }
    }
    plan.push({ at: at.getTime(), ...text });
  }
  return plan;
}
