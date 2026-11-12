import { CLF_C02 } from '@/data/exams/clf-c02';
import { getQuestionBank } from '@/data/question-bank';
import type { Question } from '@/data/question-schema';
import type { Repository } from '@/db/repository';
import {
  PRACTICE_SESSION_SIZE,
  rankDomainsByWeakness,
  selectPracticeQuestions,
  WEAKEST_DOMAIN_COUNT,
} from '@/logic/practice';
import { computeReadiness, READINESS_WINDOW } from '@/logic/readiness';

/** Route param value for a session drawn from the learner's weakest domains. */
export const WEAKEST_TARGET = 'weakest';

/**
 * Builds a practice session. `target` is a domain id ("1" to "4") or WEAKEST_TARGET, which
 * picks the domains with the lowest recent accuracy from the answer history.
 */
export async function loadPracticeQuestions(repo: Repository, target: string): Promise<Question[]> {
  const bank = getQuestionBank();
  const domain = CLF_C02.domains.find((d) => String(d.id) === target);
  if (domain) {
    return selectPracticeQuestions(bank, [domain.id], PRACTICE_SESSION_SIZE);
  }

  const domainIds = CLF_C02.domains.map((d) => d.id);
  const histories = await Promise.all(
    domainIds.map((id) =>
      repo.getRecentAnswers(CLF_C02.id, { domain: id, limit: READINESS_WINDOW }),
    ),
  );
  const readiness = computeReadiness(histories.flat(), domainIds);
  const weakest = rankDomainsByWeakness(readiness.domains).slice(0, WEAKEST_DOMAIN_COUNT);
  return selectPracticeQuestions(bank, weakest, PRACTICE_SESSION_SIZE);
}
