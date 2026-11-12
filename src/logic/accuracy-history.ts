import { dayKey, daysAgo } from '@/logic/dates';

export type DailyAccuracy = {
  /** Local calendar day, "YYYY-MM-DD". */
  day: string;
  /** Start of that day in epoch milliseconds, for formatting labels. */
  date: number;
  total: number;
  correct: number;
  /** Fraction correct, or null on a day with no answers. */
  accuracy: number | null;
};

/**
 * Accuracy for each of the last `days` calendar days, oldest first and ending today. Days
 * without answers are included with a null accuracy so a chart can show the gap. Pass
 * `domain` to count one domain only.
 */
export function dailyAccuracy(
  answers: readonly { domain: number; isCorrect: boolean; answeredAt: number }[],
  now: number,
  days: number,
  domain?: number,
): DailyAccuracy[] {
  const totals = new Map<string, { total: number; correct: number }>();
  for (const answer of answers) {
    if (domain !== undefined && answer.domain !== domain) continue;
    const key = dayKey(answer.answeredAt);
    const entry = totals.get(key) ?? { total: 0, correct: 0 };
    entry.total += 1;
    if (answer.isCorrect) entry.correct += 1;
    totals.set(key, entry);
  }

  return Array.from({ length: days }, (_, i) => {
    const date = daysAgo(now, days - 1 - i);
    const day = dayKey(date);
    const entry = totals.get(day) ?? { total: 0, correct: 0 };
    return {
      day,
      date,
      total: entry.total,
      correct: entry.correct,
      accuracy: entry.total === 0 ? null : entry.correct / entry.total,
    };
  });
}
