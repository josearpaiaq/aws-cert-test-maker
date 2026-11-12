import type { Question } from '@/data/question-schema';

export type DomainScore = { domain: number; correct: number; total: number };

export type ExamScore = {
  correct: number;
  total: number;
  /** Fraction of questions answered correctly, 0 when the exam has no questions. */
  accuracy: number;
  byDomain: DomainScore[];
};

/**
 * A response is correct only when it selects every correct option and nothing else. There is
 * no partial credit for multiple-response questions, and an empty selection is incorrect
 * (the exam guide scores unanswered questions as incorrect).
 */
export function isCorrect(question: Pick<Question, 'correct'>, selected: readonly string[]) {
  const chosen = new Set(selected);
  return chosen.size === question.correct.length && question.correct.every((id) => chosen.has(id));
}

/**
 * Scores a set of questions against the responses given (selected option ids per question
 * id). Questions with no response count as incorrect. `byDomain` lists each domain that has
 * at least one question, in ascending domain order.
 */
export function scoreExam(
  questions: readonly Pick<Question, 'id' | 'domain' | 'correct'>[],
  responses: Readonly<Record<string, readonly string[]>>,
): ExamScore {
  const domains = new Map<number, DomainScore>();
  let correct = 0;

  for (const question of questions) {
    let score = domains.get(question.domain);
    if (!score) {
      score = { domain: question.domain, correct: 0, total: 0 };
      domains.set(question.domain, score);
    }
    score.total += 1;
    if (isCorrect(question, responses[question.id] ?? [])) {
      score.correct += 1;
      correct += 1;
    }
  }

  return {
    correct,
    total: questions.length,
    accuracy: questions.length === 0 ? 0 : correct / questions.length,
    byDomain: [...domains.values()].sort((a, b) => a.domain - b.domain),
  };
}
