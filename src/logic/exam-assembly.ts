import type { ExamConfig } from '@/data/exam-config';
import { shuffle, type Random } from '@/logic/random';

/**
 * Splits `total` questions across domains in proportion to their weights, using the largest
 * remainder method so the counts always add up to `total`. For CLF-C02 and 65 questions this
 * gives 16 / 19 / 22 / 8.
 */
export function allocateByWeight(
  domains: readonly { id: number; weight: number }[],
  total: number,
): Map<number, number> {
  const weightSum = domains.reduce((sum, d) => sum + d.weight, 0);
  const allocation = new Map<number, number>(domains.map((d) => [d.id, 0]));
  if (weightSum <= 0 || total <= 0) {
    return allocation;
  }

  const shares = domains.map((d) => {
    const exact = (total * d.weight) / weightSum;
    return { id: d.id, count: Math.floor(exact), remainder: exact - Math.floor(exact) };
  });
  let left = total - shares.reduce((sum, s) => sum + s.count, 0);
  for (const share of [...shares].sort((a, b) => b.remainder - a.remainder)) {
    if (left === 0) break;
    share.count += 1;
    left -= 1;
  }

  for (const share of shares) {
    allocation.set(share.id, share.count);
  }
  return allocation;
}

/**
 * Picks the questions for a mock exam: a random selection from each domain sized by the
 * domain's weight, returned in random order with no question repeated.
 *
 * When a domain has fewer questions than its share, the exam takes all of them and fills the
 * gap from the other domains, again by weight. When the whole bank is smaller than the exam,
 * the result is the whole bank, shuffled.
 */
export function assembleExam<Q extends { id: string; domain: number }>(
  bank: readonly Q[],
  exam: Pick<ExamConfig, 'totalQuestions' | 'domains'>,
  random: Random = Math.random,
): Q[] {
  const pools = new Map<number, Q[]>(exam.domains.map((d) => [d.id, []]));
  for (const question of bank) {
    pools.get(question.domain)?.push(question);
  }
  for (const [domain, pool] of pools) {
    pools.set(domain, shuffle(pool, random));
  }

  const picked: Q[] = [];
  let needed = exam.totalQuestions;

  while (needed > 0) {
    const open = exam.domains.filter((d) => (pools.get(d.id)?.length ?? 0) > 0);
    if (open.length === 0) break;

    const allocation = allocateByWeight(open, needed);
    const before = picked.length;
    for (const domain of open) {
      const pool = pools.get(domain.id) ?? [];
      const taken = pool.splice(0, allocation.get(domain.id) ?? 0);
      picked.push(...taken);
      needed -= taken.length;
    }
    // Only zero-weight domains have questions left; they are never part of the exam.
    if (picked.length === before) break;
  }

  return shuffle(picked, random);
}
