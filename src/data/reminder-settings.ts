import type { Repository } from '@/db/repository';
import {
  DEFAULT_REMINDER_TIME,
  formatReminderTime,
  parseReminderTime,
  type ReminderTime,
} from '@/logic/reminder-time';

const ENABLED_KEY = 'reminder.enabled';
const TIME_KEY = 'reminder.time';

export type ReminderSettings = { enabled: boolean; time: ReminderTime };

/** The stored daily-reminder preferences. Off at 19:00 until the learner changes them. */
export async function loadReminderSettings(repo: Repository): Promise<ReminderSettings> {
  const [enabled, time] = await Promise.all([
    repo.getSetting(ENABLED_KEY),
    repo.getSetting(TIME_KEY),
  ]);
  return { enabled: enabled === '1', time: parseReminderTime(time) ?? DEFAULT_REMINDER_TIME };
}

export async function saveReminderSettings(
  repo: Repository,
  settings: ReminderSettings,
): Promise<void> {
  await repo.setSetting(ENABLED_KEY, settings.enabled ? '1' : '0');
  await repo.setSetting(TIME_KEY, formatReminderTime(settings.time));
}
