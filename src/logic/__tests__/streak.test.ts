import { computeStreak } from '@/logic/streak';

const at = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h).getTime();
const NOW = at(2026, 11, 11, 20);

describe('computeStreak', () => {
  it('is zero with no answers', () => {
    expect(computeStreak([], NOW)).toMatchObject({ current: 0, studiedToday: false });
  });

  it('counts today as a one-day streak', () => {
    expect(computeStreak([at(2026, 11, 11, 8)], NOW)).toMatchObject({
      current: 1,
      studiedToday: true,
    });
  });

  it('counts consecutive days ending today', () => {
    const answers = [at(2026, 11, 9), at(2026, 11, 10), at(2026, 11, 11, 7)];

    expect(computeStreak(answers, NOW)).toMatchObject({ current: 3, studiedToday: true });
  });

  it("keeps yesterday's streak alive before anything is answered today", () => {
    const answers = [at(2026, 11, 9), at(2026, 11, 10)];

    expect(computeStreak(answers, NOW)).toMatchObject({ current: 2, studiedToday: false });
  });

  it('resets after a whole day is missed', () => {
    const answers = [at(2026, 11, 7), at(2026, 11, 8), at(2026, 11, 9)];

    expect(computeStreak(answers, NOW)).toMatchObject({ current: 0, studiedToday: false });
  });

  it('stops counting at the first gap', () => {
    const answers = [at(2026, 11, 5), at(2026, 11, 6), at(2026, 11, 10), at(2026, 11, 11, 9)];

    expect(computeStreak(answers, NOW).current).toBe(2);
  });

  it('counts a day once however many answers it has', () => {
    const answers = [at(2026, 11, 11, 7), at(2026, 11, 11, 8), at(2026, 11, 11, 9)];

    expect(computeStreak(answers, NOW).current).toBe(1);
  });

  it('treats answers just before and after midnight as different days', () => {
    const answers = [
      new Date(2026, 10, 10, 23, 59).getTime(),
      new Date(2026, 10, 11, 0, 1).getTime(),
    ];

    expect(computeStreak(answers, NOW).current).toBe(2);
  });

  it('remembers the best streak after a reset', () => {
    const answers = [at(2026, 11, 1), at(2026, 11, 2), at(2026, 11, 3), at(2026, 11, 11, 9)];

    expect(computeStreak(answers, NOW)).toMatchObject({ current: 1, best: 3 });
  });
});

/** One answer at noon on each day of November 2026 from `from` to `to`, inclusive. */
const novDays = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => at(2026, 11, from + i));

describe('computeStreak freezes', () => {
  it('earns a freeze every 7 study days, up to 2', () => {
    const now = at(2026, 11, 30, 20);

    expect(computeStreak(novDays(24, 30), now)).toMatchObject({ freezes: 1, daysToNextFreeze: 7 });
    expect(computeStreak(novDays(17, 30), now)).toMatchObject({
      freezes: 2,
      daysToNextFreeze: null,
    });
    expect(computeStreak(novDays(10, 30), now)).toMatchObject({
      freezes: 2,
      daysToNextFreeze: null,
    });
  });

  it('counts down to the next freeze', () => {
    expect(computeStreak(novDays(9, 11), NOW).daysToNextFreeze).toBe(4);
  });

  it('uses a freeze to save the streak on a missed day', () => {
    const answers = [...novDays(1, 7), ...novDays(9, 11)];
    const streak = computeStreak(answers, NOW);

    expect(streak).toMatchObject({ current: 10, freezes: 0 });
    expect(streak.week.find((d) => d.day === '2026-11-08')?.state).toBe('frozen');
  });

  it('breaks the streak when there is no freeze to use', () => {
    const answers = [...novDays(3, 7), ...novDays(9, 11)];

    expect(computeStreak(answers, NOW).current).toBe(3);
  });

  it('breaks the streak when more days are missed than freezes banked', () => {
    const answers = [...novDays(1, 7), at(2026, 11, 10), at(2026, 11, 11, 9)];

    expect(computeStreak(answers, NOW)).toMatchObject({ current: 2, freezes: 0 });
  });
});

describe('computeStreak week', () => {
  it('shows the last 7 days with today pending before any study', () => {
    const week = computeStreak([at(2026, 11, 9), at(2026, 11, 10)], NOW).week;

    expect(week.map((d) => d.day)).toEqual([
      '2026-11-05',
      '2026-11-06',
      '2026-11-07',
      '2026-11-08',
      '2026-11-09',
      '2026-11-10',
      '2026-11-11',
    ]);
    expect(week.map((d) => d.state)).toEqual([
      'missed',
      'missed',
      'missed',
      'missed',
      'studied',
      'studied',
      'pending',
    ]);
  });
});
