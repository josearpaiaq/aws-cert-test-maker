import { computeStreak } from '@/logic/streak';

const at = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h).getTime();
const NOW = at(2026, 11, 11, 20);

describe('computeStreak', () => {
  it('is zero with no answers', () => {
    expect(computeStreak([], NOW)).toEqual({ current: 0, studiedToday: false });
  });

  it('counts today as a one-day streak', () => {
    expect(computeStreak([at(2026, 11, 11, 8)], NOW)).toEqual({ current: 1, studiedToday: true });
  });

  it('counts consecutive days ending today', () => {
    const answers = [at(2026, 11, 9), at(2026, 11, 10), at(2026, 11, 11, 7)];

    expect(computeStreak(answers, NOW)).toEqual({ current: 3, studiedToday: true });
  });

  it("keeps yesterday's streak alive before anything is answered today", () => {
    const answers = [at(2026, 11, 9), at(2026, 11, 10)];

    expect(computeStreak(answers, NOW)).toEqual({ current: 2, studiedToday: false });
  });

  it('resets after a whole day is missed', () => {
    const answers = [at(2026, 11, 7), at(2026, 11, 8), at(2026, 11, 9)];

    expect(computeStreak(answers, NOW)).toEqual({ current: 0, studiedToday: false });
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
});
