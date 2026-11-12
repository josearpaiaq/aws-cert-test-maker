import { rankDomainsByWeakness, selectPracticeQuestions } from '@/logic/practice';

function domain(id: number, accuracy: number | null) {
  return { domain: id, answered: 0, correct: 0, accuracy, ready: false };
}

const sequence = (values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length];
};

describe('rankDomainsByWeakness', () => {
  it('orders domains from lowest to highest accuracy', () => {
    const ranked = rankDomainsByWeakness([domain(1, 0.9), domain(2, 0.4), domain(3, 0.7)]);

    expect(ranked).toEqual([2, 3, 1]);
  });

  it('puts domains with no answers before any answered domain', () => {
    const ranked = rankDomainsByWeakness([domain(1, 0), domain(2, null), domain(3, 0.5)]);

    expect(ranked).toEqual([2, 1, 3]);
  });

  it('keeps the original order for domains with equal accuracy', () => {
    const ranked = rankDomainsByWeakness([domain(1, null), domain(2, null), domain(3, null)]);

    expect(ranked).toEqual([1, 2, 3]);
  });

  it('returns nothing for no domains', () => {
    expect(rankDomainsByWeakness([])).toEqual([]);
  });
});

describe('selectPracticeQuestions', () => {
  const bank = Array.from({ length: 40 }, (_, i) => ({ id: `q${i}`, domain: (i % 4) + 1 }));

  it('returns only questions from the requested domains', () => {
    const picked = selectPracticeQuestions(bank, [2, 4], 10);

    expect(picked).toHaveLength(10);
    expect(picked.every((q) => q.domain === 2 || q.domain === 4)).toBe(true);
  });

  it('never repeats a question', () => {
    const picked = selectPracticeQuestions(bank, [1], 10);

    expect(new Set(picked.map((q) => q.id)).size).toBe(10);
  });

  it('returns every matching question when there are fewer than the session size', () => {
    expect(selectPracticeQuestions(bank, [3], 25)).toHaveLength(10);
  });

  it('returns nothing for a domain with no questions', () => {
    expect(selectPracticeQuestions(bank, [9], 10)).toEqual([]);
  });

  it('orders questions by the random source', () => {
    const first = selectPracticeQuestions(bank, [1], 10, sequence([0.1, 0.7, 0.3, 0.9]));
    const second = selectPracticeQuestions(bank, [1], 10, sequence([0.8, 0.2, 0.6, 0.4]));

    expect(first.map((q) => q.id)).not.toEqual(second.map((q) => q.id));
  });
});
