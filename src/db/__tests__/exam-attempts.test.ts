import { CLF_C02 } from '@/data/exams/clf-c02';
import type { Question } from '@/data/question-schema';
import { questionsForAttempt, startExam, submitExam } from '@/db/exam-attempts';
import { migrate } from '@/db/migrations';
import { createRepository, type Repository } from '@/db/repository';

import { createTestDatabase } from './test-database';

const EXAM = CLF_C02.id;
const NOW = 1_700_000_000_000;

function bankOf(perDomain: number): Question[] {
  return CLF_C02.domains.flatMap((domain) =>
    Array.from({ length: perDomain }, (_, i) => ({
      id: `d${domain.id}-q${i}`,
      domain: domain.id,
      taskStatement: domain.taskStatements[0].id,
      type: 'single' as const,
      prompt: 'A question?',
      options: ['a', 'b', 'c', 'd'].map((id) => ({ id, text: id })),
      correct: ['a'],
      explanation: 'Because.',
      services: [],
      difficulty: 1 as const,
      source: 'https://docs.aws.amazon.com/',
    })),
  );
}

describe('exam attempts', () => {
  let repo: Repository;

  beforeEach(async () => {
    const db = createTestDatabase();
    await migrate(db);
    repo = createRepository(db);
  });

  async function inProgress() {
    const attempt = await repo.getInProgressExamAttempt(EXAM);
    if (!attempt) throw new Error('expected an in-progress attempt');
    return attempt;
  }

  describe('startExam', () => {
    it('stores a 65-question attempt that ends 90 minutes after it starts', async () => {
      const id = await startExam(repo, CLF_C02, bankOf(100), NOW);

      const attempt = await inProgress();
      expect(attempt.id).toBe(id);
      expect(attempt.questionIds).toHaveLength(65);
      expect(attempt.startedAt).toBe(NOW);
      expect(attempt.endsAt).toBe(NOW + 90 * 60 * 1000);
    });

    it('uses the whole bank when it has fewer than 65 questions', async () => {
      await startExam(repo, CLF_C02, bankOf(10), NOW);

      expect((await inProgress()).questionIds).toHaveLength(40);
    });
  });

  describe('questionsForAttempt', () => {
    it('returns the questions in the order of the attempt', () => {
      const bank = bankOf(2);

      const questions = questionsForAttempt({ questionIds: ['d3-q1', 'd1-q0'] }, bank);

      expect(questions.map((q) => q.id)).toEqual(['d3-q1', 'd1-q0']);
    });

    it('leaves out questions that are no longer in the bank', () => {
      const questions = questionsForAttempt({ questionIds: ['d1-q0', 'removed'] }, bankOf(1));

      expect(questions.map((q) => q.id)).toEqual(['d1-q0']);
    });
  });

  describe('submitExam', () => {
    it('scores the attempt, counting unanswered questions as incorrect', async () => {
      const bank = bankOf(1);
      await startExam(repo, CLF_C02, bank, NOW);
      const attempt = await inProgress();
      await repo.saveExamProgress(attempt.id, {
        responses: { 'd1-q0': ['a'], 'd2-q0': ['b'] },
        flagged: [],
      });

      const score = await submitExam(repo, await inProgress(), bank, NOW + 5000);

      expect(score).toMatchObject({ correct: 1, total: 4, accuracy: 0.25 });
    });

    it('closes the attempt with its result', async () => {
      const bank = bankOf(1);
      const id = await startExam(repo, CLF_C02, bank, NOW);
      await repo.saveExamProgress(id, { responses: { 'd1-q0': ['a'] }, flagged: [] });

      await submitExam(repo, await inProgress(), bank, NOW + 5000);

      expect(await repo.getInProgressExamAttempt(EXAM)).toBeNull();
      expect(await repo.getExamAttempt(id)).toMatchObject({
        status: 'submitted',
        submittedAt: NOW + 5000,
        correctCount: 1,
        totalCount: 4,
      });
    });

    it('writes every question to the answer history, linked to the attempt', async () => {
      const bank = bankOf(1);
      const id = await startExam(repo, CLF_C02, bank, NOW);
      await repo.saveExamProgress(id, { responses: { 'd1-q0': ['a'] }, flagged: [] });

      await submitExam(repo, await inProgress(), bank, NOW + 5000);

      const answers = await repo.getRecentAnswers(EXAM, { limit: 10 });
      expect(answers).toHaveLength(4);
      expect(answers.every((a) => a.mode === 'exam' && a.examAttemptId === id)).toBe(true);
      expect(answers.filter((a) => a.isCorrect).map((a) => a.questionId)).toEqual(['d1-q0']);
    });

    it('schedules missed and unanswered questions for review, but not correct ones', async () => {
      const bank = bankOf(1);
      const id = await startExam(repo, CLF_C02, bank, NOW);
      await repo.saveExamProgress(id, {
        responses: { 'd1-q0': ['a'], 'd2-q0': ['b'] },
        flagged: [],
      });

      await submitExam(repo, await inProgress(), bank, NOW);

      const due = await repo.getDueReviews(EXAM, NOW + 2 * 24 * 60 * 60 * 1000);
      expect(due.map((r) => r.questionId).sort()).toEqual(['d2-q0', 'd3-q0', 'd4-q0']);
    });

    it('saves nothing if closing the attempt fails', async () => {
      const bank = bankOf(1);
      await startExam(repo, CLF_C02, bank, NOW);
      const attempt = await inProgress();
      jest.spyOn(repo, 'submitExamAttempt').mockRejectedValue(new Error('disk full'));

      await expect(submitExam(repo, attempt, bank, NOW)).rejects.toThrow('disk full');

      expect(await repo.getRecentAnswers(EXAM, { limit: 10 })).toEqual([]);
      expect(await repo.getInProgressExamAttempt(EXAM)).not.toBeNull();
    });
  });
});
