import { qualityOf, scheduleReview, sm2, type ReviewState } from '@/logic/spaced-repetition';

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 10, 11, 12);

describe('qualityOf', () => {
  it.each([
    [{ isCorrect: false }, 1],
    [{ isCorrect: false, confidence: 'high' as const }, 1],
    [{ isCorrect: true, confidence: 'low' as const }, 3],
    [{ isCorrect: true }, 4],
    [{ isCorrect: true, confidence: 'high' as const }, 5],
  ])('grades %j as %i', (answer, quality) => {
    expect(qualityOf(answer)).toBe(quality);
  });
});

describe('sm2', () => {
  it('schedules a first passing review for the next day', () => {
    expect(sm2(null, 4, NOW)).toEqual({
      dueAt: NOW + DAY,
      intervalDays: 1,
      easeFactor: 2.5,
      repetitions: 1,
      lastReviewedAt: NOW,
    });
  });

  it('grows the interval 1, 6, then by the ease factor on repeated passes', () => {
    let state: ReviewState | null = null;
    const intervals: number[] = [];
    for (let i = 0; i < 4; i++) {
      state = sm2(state, 4, NOW + i * DAY);
      intervals.push(state.intervalDays);
    }

    // Quality 4 leaves the ease factor at 2.5: 6 * 2.5 = 15, 15 * 2.5 = 37.5 -> 38.
    expect(intervals).toEqual([1, 6, 15, 38]);
  });

  it('resets repetitions and interval after a failing grade', () => {
    const learned = sm2(sm2(sm2(null, 5, NOW), 5, NOW), 5, NOW);

    const lapsed = sm2(learned, 1, NOW);

    expect(lapsed.repetitions).toBe(0);
    expect(lapsed.intervalDays).toBe(1);
    expect(lapsed.dueAt).toBe(NOW + DAY);
  });

  it('raises the ease factor for a perfect answer and lowers it for a hesitant one', () => {
    expect(sm2(null, 5, NOW).easeFactor).toBeCloseTo(2.6);
    expect(sm2(null, 3, NOW).easeFactor).toBeCloseTo(2.36);
  });

  it('never lets the ease factor fall below 1.3', () => {
    let state: ReviewState | null = null;
    for (let i = 0; i < 20; i++) {
      state = sm2(state, 0, NOW);
    }

    expect(state?.easeFactor).toBe(1.3);
  });

  it('brings a hard question back sooner than an easy one', () => {
    const answerThreeTimes = (quality: 3 | 5) =>
      sm2(sm2(sm2(null, quality, NOW), quality, NOW), quality, NOW);

    expect(answerThreeTimes(3).intervalDays).toBeLessThan(answerThreeTimes(5).intervalDays);
  });
});

describe('scheduleReview', () => {
  it('leaves a never-scheduled question alone when it is answered correctly', () => {
    expect(scheduleReview(null, { isCorrect: true }, NOW)).toBeNull();
    expect(scheduleReview(null, { isCorrect: true, confidence: 'high' }, NOW)).toBeNull();
  });

  it('schedules a question the first time it is missed', () => {
    expect(scheduleReview(null, { isCorrect: false }, NOW)).toMatchObject({
      dueAt: NOW + DAY,
      repetitions: 0,
    });
  });

  it('schedules a question answered correctly but with low confidence', () => {
    expect(scheduleReview(null, { isCorrect: true, confidence: 'low' }, NOW)).toMatchObject({
      dueAt: NOW + DAY,
      repetitions: 1,
    });
  });

  it('keeps rescheduling a question that is already in the schedule', () => {
    const first = scheduleReview(null, { isCorrect: false }, NOW);
    const second = scheduleReview(first, { isCorrect: true }, NOW + DAY);
    const third = scheduleReview(second, { isCorrect: true }, NOW + 2 * DAY);

    expect(second?.intervalDays).toBe(1);
    expect(third?.intervalDays).toBe(6);
    expect(third?.dueAt).toBe(NOW + 2 * DAY + 6 * DAY);
  });
});
