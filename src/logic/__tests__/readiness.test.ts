import { computeReadiness } from '@/logic/readiness';

const DOMAINS = [1, 2, 3, 4];

/** `count` answers for a domain, the first `correct` of them right. */
function answers(domain: number, count: number, correct: number) {
  return Array.from({ length: count }, (_, i) => ({ domain, isCorrect: i < correct }));
}

describe('computeReadiness', () => {
  it('is ready when every domain has a full window at or above 80%', () => {
    const history = DOMAINS.flatMap((d) => answers(d, 50, 40));

    const readiness = computeReadiness(history, DOMAINS);

    expect(readiness.ready).toBe(true);
    expect(readiness.domains[0]).toEqual({
      domain: 1,
      answered: 50,
      correct: 40,
      accuracy: 0.8,
      ready: true,
    });
  });

  it('is not ready when one domain is below the threshold', () => {
    const history = [
      ...answers(1, 50, 50),
      ...answers(2, 50, 50),
      ...answers(3, 50, 39),
      ...answers(4, 50, 50),
    ];

    const readiness = computeReadiness(history, DOMAINS);

    expect(readiness.ready).toBe(false);
    expect(readiness.domains.map((d) => d.ready)).toEqual([true, true, false, true]);
  });

  it('is not ready while a domain has fewer answers than the window, even at 100%', () => {
    const history = [
      ...answers(1, 50, 50),
      ...answers(2, 50, 50),
      ...answers(3, 50, 50),
      ...answers(4, 49, 49),
    ];

    const readiness = computeReadiness(history, DOMAINS);

    expect(readiness.ready).toBe(false);
    expect(readiness.domains[3]).toMatchObject({ answered: 49, accuracy: 1, ready: false });
  });

  it('reports a domain with no answers as not ready with no accuracy', () => {
    const readiness = computeReadiness(answers(1, 50, 50), DOMAINS);

    expect(readiness.domains[1]).toEqual({
      domain: 2,
      answered: 0,
      correct: 0,
      accuracy: null,
      ready: false,
    });
  });

  it('counts only the most recent answers in each domain', () => {
    // Most recent first: 50 correct answers, then 200 older wrong ones.
    const history = DOMAINS.flatMap((d) => [...answers(d, 50, 50), ...answers(d, 200, 0)]);

    expect(computeReadiness(history, DOMAINS).ready).toBe(true);
  });

  it('counts each domain separately when answers are interleaved', () => {
    const history = Array.from({ length: 200 }, (_, i) => ({
      domain: (i % 4) + 1,
      isCorrect: true,
    }));

    expect(computeReadiness(history, DOMAINS).ready).toBe(true);
  });

  it('is not ready with no history', () => {
    expect(computeReadiness([], DOMAINS).ready).toBe(false);
  });

  it('is not ready for an exam with no domains', () => {
    expect(computeReadiness(answers(1, 50, 50), [])).toEqual({ ready: false, domains: [] });
  });

  it('honours a custom window and threshold', () => {
    const history = DOMAINS.flatMap((d) => answers(d, 10, 9));

    expect(computeReadiness(history, DOMAINS, { window: 10, threshold: 0.9 }).ready).toBe(true);
    expect(computeReadiness(history, DOMAINS, { window: 10, threshold: 0.95 }).ready).toBe(false);
  });
});
