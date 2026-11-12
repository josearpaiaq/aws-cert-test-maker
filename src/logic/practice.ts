import { shuffle, type Random } from '@/logic/random';
import type { DomainReadiness } from '@/logic/readiness';

/** Questions in one practice session. */
export const PRACTICE_SESSION_SIZE = 10;
/** How many of the weakest domains a "weakest areas" session draws from. */
export const WEAKEST_DOMAIN_COUNT = 2;

/**
 * Domain ids ordered weakest first. Domains with no answers yet come first (nothing is known
 * about them), then lowest accuracy. Ties keep the order of the input.
 */
export function rankDomainsByWeakness(domains: readonly DomainReadiness[]): number[] {
  return domains
    .map((domain, index) => ({ domain, index }))
    .sort((a, b) => (a.domain.accuracy ?? -1) - (b.domain.accuracy ?? -1) || a.index - b.index)
    .map(({ domain }) => domain.domain);
}

/** A random selection of up to `size` questions from the given domains, in random order. */
export function selectPracticeQuestions<Q extends { domain: number }>(
  bank: readonly Q[],
  domainIds: readonly number[],
  size: number,
  random: Random = Math.random,
): Q[] {
  const pool = bank.filter((question) => domainIds.includes(question.domain));
  return shuffle(pool, random).slice(0, size);
}
