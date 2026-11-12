import { dailyAccuracy } from '@/logic/accuracy-history';

const at = (d: number, h = 12) => new Date(2026, 10, d, h).getTime();
const NOW = at(11, 20);

const answer = (day: number, domain: number, isCorrect: boolean) => ({
  domain,
  isCorrect,
  answeredAt: at(day),
});

describe('dailyAccuracy', () => {
  it('returns one entry per day, oldest first, ending today', () => {
    const history = dailyAccuracy([], NOW, 3);

    expect(history.map((d) => d.day)).toEqual(['2026-11-09', '2026-11-10', '2026-11-11']);
  });

  it('marks days without answers with a null accuracy', () => {
    const history = dailyAccuracy([answer(11, 1, true)], NOW, 2);

    expect(history[0]).toMatchObject({ total: 0, correct: 0, accuracy: null });
  });

  it('computes accuracy for each day separately', () => {
    const answers = [
      answer(10, 1, true),
      answer(10, 1, false),
      answer(11, 1, true),
      answer(11, 2, true),
      answer(11, 2, true),
      answer(11, 3, false),
    ];

    const history = dailyAccuracy(answers, NOW, 2);

    expect(history[0]).toMatchObject({ total: 2, correct: 1, accuracy: 0.5 });
    expect(history[1]).toMatchObject({ total: 4, correct: 3, accuracy: 0.75 });
  });

  it('counts only the requested domain', () => {
    const answers = [answer(11, 1, true), answer(11, 2, false), answer(11, 2, false)];

    const history = dailyAccuracy(answers, NOW, 1, 2);

    expect(history[0]).toMatchObject({ total: 2, correct: 0, accuracy: 0 });
  });

  it('ignores answers older than the window', () => {
    const history = dailyAccuracy([answer(1, 1, true)], NOW, 3);

    expect(history.every((d) => d.total === 0)).toBe(true);
  });
});
