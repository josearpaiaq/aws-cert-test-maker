const DAY_MS = 24 * 60 * 60 * 1000;
const INITIAL_EASE_FACTOR = 2.5;
const MIN_EASE_FACTOR = 1.3;

/** SM-2 state for one question. Timestamps are Unix epoch milliseconds. */
export type ReviewState = {
  dueAt: number;
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  lastReviewedAt: number;
};

/** SM-2 response quality: 0 (complete blackout) to 5 (perfect response). */
export type Quality = 0 | 1 | 2 | 3 | 4 | 5;

export type ReviewAnswer = { isCorrect: boolean; confidence?: 'low' | 'high' };

/**
 * Maps an answer to an SM-2 quality grade: wrong is 1, correct but unsure is 3 (the lowest
 * passing grade), correct is 4, and correct and confident is 5.
 */
export function qualityOf(answer: ReviewAnswer): Quality {
  if (!answer.isCorrect) return 1;
  if (answer.confidence === 'low') return 3;
  return answer.confidence === 'high' ? 5 : 4;
}

/**
 * The SM-2 algorithm. A passing grade (3 or more) grows the interval: 1 day, then 6 days,
 * then the previous interval times the ease factor. A failing grade restarts at 1 day. The
 * ease factor moves with every grade and never drops below 1.3.
 */
export function sm2(previous: ReviewState | null, quality: Quality, now: number): ReviewState {
  const previousEase = previous?.easeFactor ?? INITIAL_EASE_FACTOR;
  const easeFactor = Math.max(
    MIN_EASE_FACTOR,
    previousEase + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
  );

  let repetitions: number;
  let intervalDays: number;
  if (quality < 3) {
    repetitions = 0;
    intervalDays = 1;
  } else {
    repetitions = (previous?.repetitions ?? 0) + 1;
    if (repetitions === 1) {
      intervalDays = 1;
    } else if (repetitions === 2) {
      intervalDays = 6;
    } else {
      intervalDays = Math.round((previous?.intervalDays ?? 1) * easeFactor);
    }
  }

  return {
    dueAt: now + intervalDays * DAY_MS,
    intervalDays,
    easeFactor,
    repetitions,
    lastReviewedAt: now,
  };
}

/**
 * Decides what an answer does to a question's review schedule. A question enters the
 * schedule the first time it is missed or answered with low confidence; after that, every
 * answer reschedules it. Returns null when the question should stay unscheduled.
 */
export function scheduleReview(
  previous: ReviewState | null,
  answer: ReviewAnswer,
  now: number,
): ReviewState | null {
  if (!previous && answer.isCorrect && answer.confidence !== 'low') {
    return null;
  }
  return sm2(previous, qualityOf(answer), now);
}
