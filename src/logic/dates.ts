export const DAY_MS = 24 * 60 * 60 * 1000;

/** The local calendar day of a timestamp as "YYYY-MM-DD". */
export function dayKey(timestamp: number): string {
  const date = new Date(timestamp);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** The first millisecond of the local day containing `timestamp`. */
export function startOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/** The last millisecond of the local day containing `timestamp`. */
export function endOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(23, 59, 59, 999);
  return date.getTime();
}

/**
 * The local midnight `days` calendar days before the day containing `timestamp`. Works on
 * calendar dates rather than subtracting 24-hour blocks, so daylight-saving changes do not
 * shift the result.
 */
export function daysAgo(timestamp: number, days: number): number {
  const date = new Date(startOfDay(timestamp));
  date.setDate(date.getDate() - days);
  return date.getTime();
}
