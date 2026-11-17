import { useEffect } from 'react';

import { loadReminderSettings } from '@/data/reminder-settings';
import { useRepository } from '@/db/use-repository';
import { requestReminderPermission, scheduleDailyReminder } from '@/notifications/daily-reminder';

/**
 * Re-applies the daily reminder at startup when it is switched on, so a reminder scheduled by
 * an older version of the app moves to the current notification channel. Renders nothing.
 */
export function ReminderSync() {
  const repo = useRepository();

  useEffect(() => {
    (async () => {
      const settings = await loadReminderSettings(repo);
      if (!settings.enabled) return;
      const permission = await requestReminderPermission();
      if (permission.granted) await scheduleDailyReminder(settings.time);
    })().catch(() => undefined);
  }, [repo]);

  return null;
}
