import { CLF_C02 } from '@/data/exams/clf-c02';
import { allocateByWeight, assembleExam } from '@/logic/exam-assembly';
import type { Random } from '@/logic/random';

/** A small deterministic pseudo-random generator (mulberry32). */
function seeded(seed: number): Random {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function bankOf(counts: Record<number, number>) {
  return Object.entries(counts).flatMap(([domain, count]) =>
    Array.from({ length: count }, (_, i) => ({ id: `d${domain}-${i}`, domain: Number(domain) })),
  );
}

function countByDomain(questions: { domain: number }[]) {
  const counts: Record<number, number> = {};
  for (const q of questions) counts[q.domain] = (counts[q.domain] ?? 0) + 1;
  return counts;
}

describe('allocateByWeight', () => {
  it('splits 65 CLF-C02 questions into 16 / 19 / 22 / 8', () => {
    const allocation = allocateByWeight(CLF_C02.domains, 65);

    expect([...allocation.entries()]).toEqual([
      [1, 16],
      [2, 19],
      [3, 22],
      [4, 8],
    ]);
  });

  it.each([1, 7, 50, 64, 65, 100])('always allocates exactly %i questions', (total) => {
    const allocation = allocateByWeight(CLF_C02.domains, total);

    expect([...allocation.values()].reduce((a, b) => a + b, 0)).toBe(total);
  });

  it('allocates nothing when there are no questions to hand out', () => {
    expect([...allocateByWeight(CLF_C02.domains, 0).values()]).toEqual([0, 0, 0, 0]);
  });

  it('works with weights that do not sum to 1', () => {
    const allocation = allocateByWeight(
      [
        { id: 1, weight: 3 },
        { id: 2, weight: 1 },
      ],
      8,
    );

    expect([...allocation.entries()]).toEqual([
      [1, 6],
      [2, 2],
    ]);
  });
});

describe('assembleExam', () => {
  it('picks 65 unique questions weighted by domain from a large bank', () => {
    const bank = bankOf({ 1: 120, 2: 150, 3: 170, 4: 60 });

    const exam = assembleExam(bank, CLF_C02, seeded(1));

    expect(exam).toHaveLength(65);
    expect(new Set(exam.map((q) => q.id)).size).toBe(65);
    expect(countByDomain(exam)).toEqual({ 1: 16, 2: 19, 3: 22, 4: 8 });
  });

  it('mixes the domains instead of grouping them', () => {
    const bank = bankOf({ 1: 120, 2: 150, 3: 170, 4: 60 });

    const domains = assembleExam(bank, CLF_C02, seeded(2)).map((q) => q.domain);

    expect(domains).not.toEqual([...domains].sort((a, b) => a - b));
  });

  it('gives a different exam for a different random sequence', () => {
    const bank = bankOf({ 1: 120, 2: 150, 3: 170, 4: 60 });

    const first = assembleExam(bank, CLF_C02, seeded(1)).map((q) => q.id);
    const second = assembleExam(bank, CLF_C02, seeded(99)).map((q) => q.id);

    expect(first).not.toEqual(second);
  });

  it('gives the same exam for the same random sequence', () => {
    const bank = bankOf({ 1: 120, 2: 150, 3: 170, 4: 60 });

    expect(assembleExam(bank, CLF_C02, seeded(5))).toEqual(assembleExam(bank, CLF_C02, seeded(5)));
  });

  it('returns the whole bank when it is smaller than the exam', () => {
    const bank = bankOf({ 1: 10, 2: 10, 3: 10, 4: 10 });

    const exam = assembleExam(bank, CLF_C02, seeded(3));

    expect(exam).toHaveLength(40);
    expect(new Set(exam.map((q) => q.id)).size).toBe(40);
  });

  it('fills the gap from other domains when one domain is empty', () => {
    const bank = bankOf({ 1: 100, 2: 100, 3: 100 });

    const exam = assembleExam(bank, CLF_C02, seeded(4));

    expect(exam).toHaveLength(65);
    expect(countByDomain(exam)[4]).toBeUndefined();
    expect(new Set(exam.map((q) => q.id)).size).toBe(65);
  });

  it('uses every question of a short domain and tops up from the rest', () => {
    const bank = bankOf({ 1: 100, 2: 100, 3: 5, 4: 100 });

    const exam = assembleExam(bank, CLF_C02, seeded(6));

    expect(exam).toHaveLength(65);
    expect(countByDomain(exam)[3]).toBe(5);
  });

  it('returns an empty exam for an empty bank', () => {
    expect(assembleExam([], CLF_C02, seeded(7))).toEqual([]);
  });

  it('ignores questions from domains the exam does not have', () => {
    const bank = [...bankOf({ 1: 100, 2: 100, 3: 100, 4: 100 }), { id: 'stray', domain: 9 }];

    const exam = assembleExam(bank, CLF_C02, seeded(8));

    expect(exam.some((q) => q.id === 'stray')).toBe(false);
  });

  it('does not change the bank it is given', () => {
    const bank = bankOf({ 1: 30, 2: 30, 3: 30, 4: 30 });
    const before = bank.map((q) => q.id);

    assembleExam(bank, CLF_C02, seeded(9));

    expect(bank.map((q) => q.id)).toEqual(before);
  });
});
