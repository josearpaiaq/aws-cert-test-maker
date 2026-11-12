import type { AnswerMode, Confidence, Repository } from '@/db/repository';
import { scheduleReview } from '@/logic/spaced-repetition';

/**
 * Saves an answer to the history and updates the question's spaced-repetition schedule.
 * Returns the id of the stored answer.
 */
export async function recordAnswer(
  repo: Repository,
  answer: {
    examId: string;
    questionId: string;
    domain: number;
    mode: AnswerMode;
    selected: string[];
    isCorrect: boolean;
    confidence?: Confidence;
    now: number;
  },
): Promise<number> {
  const { now, ...fields } = answer;
  const id = await repo.recordAnswer({ ...fields, answeredAt: now });

  const previous = await repo.getReview(answer.examId, answer.questionId);
  const next = scheduleReview(previous, answer, now);
  if (next) {
    await repo.saveReview({ examId: answer.examId, questionId: answer.questionId, ...next });
  }
  return id;
}
