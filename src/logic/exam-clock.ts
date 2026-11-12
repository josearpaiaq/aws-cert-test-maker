/** Milliseconds left until `endsAt`, never negative. Both arguments are epoch milliseconds. */
export function remainingMs(endsAt: number, now: number): number {
  return Math.max(0, endsAt - now);
}

/**
 * Formats a duration as MM:SS for the exam countdown, e.g. 90 minutes is "90:00". Partial
 * seconds round up, so the clock shows "00:01" until the time is really gone.
 */
export function formatClock(ms: number): string {
  const totalSeconds = Math.ceil(Math.max(0, ms) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
