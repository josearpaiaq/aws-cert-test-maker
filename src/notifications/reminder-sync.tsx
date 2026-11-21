import { useEffect } from 'react';
import { AppState } from 'react-native';

import { loadStreak } from '@/data/progress';
import { loadReminderSettings } from '@/data/reminder-settings';
import type { Repository } from '@/db/repository';
import { useRepository } from '@/db/use-repository';
import { requestReminderPermission, scheduleDailyReminder } from '@/notifications/daily-reminder';
import { updateStreakWidget } from '@/widgets/update-streak-widget';

/** Refreshes everything that shows the streak outside the app: the widget and the reminders. */
async function syncReminder(repo: Repository): Promise<void> {
  const now = Date.now();
  const streak = await loadStreak(repo, now);
  updateStreakWidget(streak, now);

  const settings = await loadReminderSettings(repo);
  if (!settings.enabled) return;
  const permission = await requestReminderPermission();
  if (permission.granted) await scheduleDailyReminder(settings.time, streak);
}

/**
 * Re-applies the daily reminder and updates the streak widget at startup and whenever the app
 * goes to the background, so both show the current streak and today's reminder is dropped once
 * the learner has studied. This also moves a reminder scheduled by an older version of the app
 * to the current notification channel. Renders nothing.
 */
export function ReminderSync() {
  const repo = useRepository();

  useEffect(() => {
    syncReminder(repo).catch(() => undefined);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'background') syncReminder(repo).catch(() => undefined);
    });
    return () => subscription.remove();
  }, [repo]);

  return null;
}
