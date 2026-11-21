import { useEffect } from 'react';
import { AppState } from 'react-native';

import { loadStreak } from '@/data/progress';
import { loadReminderSettings } from '@/data/reminder-settings';
import type { Repository } from '@/db/repository';
import { useRepository } from '@/db/use-repository';
import { requestReminderPermission, scheduleDailyReminder } from '@/notifications/daily-reminder';

async function syncReminder(repo: Repository): Promise<void> {
  const settings = await loadReminderSettings(repo);
  if (!settings.enabled) return;
  const permission = await requestReminderPermission();
  if (permission.granted) {
    await scheduleDailyReminder(settings.time, await loadStreak(repo, Date.now()));
  }
}

/**
 * Re-applies the daily reminder at startup and whenever the app goes to the background, so the
 * reminders name the current streak and today's is dropped once the learner has studied. This
 * also moves a reminder scheduled by an older version of the app to the current notification
 * channel. Renders nothing.
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
