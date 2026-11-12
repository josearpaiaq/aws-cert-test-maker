export type ReminderTime = { hour: number; minute: number };

export const DEFAULT_REMINDER_TIME: ReminderTime = { hour: 19, minute: 0 };

/** Serializes a time as 24-hour "HH:MM" for storage. */
export function formatReminderTime(time: ReminderTime): string {
  return `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}`;
}

/** Parses a stored "HH:MM" value. Returns null for anything that is not a valid time. */
export function parseReminderTime(value: string | null): ReminderTime | null {
  const match = value ? /^(\d{2}):(\d{2})$/.exec(value) : null;
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  return hour <= 23 && minute <= 59 ? { hour, minute } : null;
}
