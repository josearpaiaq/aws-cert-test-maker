import type { ExamConfig } from '@/data/exam-config';
import type { Question } from '@/data/question-schema';
import { recordAnswer } from '@/db/record-answer';
import type { ExamAttempt, Repository } from '@/db/repository';
import { assembleExam } from '@/logic/exam-assembly';
import type { Random } from '@/logic/random';
import { isCorrect, scoreExam, type ExamScore } from '@/logic/scoring';

const MINUTE_MS = 60 * 1000;

/** Assembles a weighted mock exam and stores it as the in-progress attempt. Returns its id. */
export async function startExam(
  repo: Repository,
  exam: ExamConfig,
  bank: readonly Question[],
  now: number,
  random: Random = Math.random,
): Promise<number> {
  const questions = assembleExam(bank, exam, random);
  return repo.startExamAttempt({
    examId: exam.id,
    questionIds: questions.map((q) => q.id),
    startedAt: now,
    endsAt: now + exam.durationMinutes * MINUTE_MS,
  });
}

/**
 * The attempt's questions in exam order. A question that is no longer in the bank is left
 * out, so an attempt started before a bank update can still be shown and scored.
 */
export function questionsForAttempt(
  attempt: Pick<ExamAttempt, 'questionIds'>,
  bank: readonly Question[],
): Question[] {
  const byId = new Map(bank.map((q) => [q.id, q]));
  return attempt.questionIds.flatMap((id) => byId.get(id) ?? []);
}

/**
 * Scores an in-progress attempt and closes it. Every question is written to the answer
 * history (unanswered ones as incorrect) so the exam counts toward readiness and review
 * scheduling. All of it happens in one transaction.
 */
export async function submitExam(
  repo: Repository,
  attempt: ExamAttempt,
  bank: readonly Question[],
  now: number,
): Promise<ExamScore> {
  const questions = questionsForAttempt(attempt, bank);
  const score = scoreExam(questions, attempt.responses);

  await repo.transaction(async () => {
    for (const question of questions) {
      const selected = attempt.responses[question.id] ?? [];
      await recordAnswer(repo, {
        examId: attempt.examId,
        questionId: question.id,
        domain: question.domain,
        mode: 'exam',
        selected,
        isCorrect: isCorrect(question, selected),
        examAttemptId: attempt.id,
        now,
      });
    }
    await repo.submitExamAttempt(attempt.id, {
      submittedAt: now,
      correctCount: score.correct,
      totalCount: score.total,
    });
  });

  return score;
}
