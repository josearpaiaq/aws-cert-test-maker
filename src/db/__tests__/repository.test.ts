import { migrate } from '@/db/migrations';
import { createRepository, type NewAnswer, type Repository } from '@/db/repository';

import { createTestDatabase } from './test-database';

const EXAM = 'clf-c02';

function answer(overrides: Partial<NewAnswer> = {}): NewAnswer {
  return {
    examId: EXAM,
    questionId: 'd1-benefits-001',
    domain: 1,
    mode: 'practice',
    selected: ['b'],
    isCorrect: true,
    answeredAt: 1000,
    ...overrides,
  };
}

describe('repository', () => {
  let repo: Repository;

  beforeEach(async () => {
    const db = createTestDatabase();
    await migrate(db);
    repo = createRepository(db);
  });

  describe('answers', () => {
    it('round-trips an answer, including optional fields', async () => {
      const id = await repo.recordAnswer(
        answer({ selected: ['a', 'c'], isCorrect: false, confidence: 'low' }),
      );

      const [saved] = await repo.getRecentAnswers(EXAM, { limit: 10 });
      expect(saved).toEqual({
        id,
        ...answer({ selected: ['a', 'c'], isCorrect: false, confidence: 'low' }),
      });
    });

    it('returns the most recent answers first, limited and filtered by domain', async () => {
      await repo.recordAnswer(answer({ questionId: 'q1', domain: 1, answeredAt: 1 }));
      await repo.recordAnswer(answer({ questionId: 'q2', domain: 2, answeredAt: 2 }));
      await repo.recordAnswer(answer({ questionId: 'q3', domain: 1, answeredAt: 3 }));
      await repo.recordAnswer(answer({ questionId: 'q4', domain: 1, answeredAt: 4 }));

      const recent = await repo.getRecentAnswers(EXAM, { domain: 1, limit: 2 });

      expect(recent.map((a) => a.questionId)).toEqual(['q4', 'q3']);
    });

    it('keeps answers for different exams apart', async () => {
      await repo.recordAnswer(answer({ examId: 'other-exam' }));

      expect(await repo.getRecentAnswers(EXAM, { limit: 10 })).toEqual([]);
    });
  });

  describe('review schedule', () => {
    const review = {
      examId: EXAM,
      questionId: 'q1',
      dueAt: 5000,
      intervalDays: 1,
      easeFactor: 2.5,
      repetitions: 1,
      lastReviewedAt: 1000,
    };

    it('inserts and then updates the schedule for a question', async () => {
      await repo.saveReview(review);
      await repo.saveReview({ ...review, dueAt: 9000, intervalDays: 6, repetitions: 2 });

      expect(await repo.getReview(EXAM, 'q1')).toEqual({
        ...review,
        dueAt: 9000,
        intervalDays: 6,
        repetitions: 2,
      });
    });

    it('returns null for a question that has never been scheduled', async () => {
      expect(await repo.getReview(EXAM, 'missing')).toBeNull();
    });

    it('lists only reviews that are due, most overdue first', async () => {
      await repo.saveReview({ ...review, questionId: 'later', dueAt: 9000 });
      await repo.saveReview({ ...review, questionId: 'due-now', dueAt: 5000 });
      await repo.saveReview({ ...review, questionId: 'overdue', dueAt: 100 });

      const due = await repo.getDueReviews(EXAM, 5000);

      expect(due.map((r) => r.questionId)).toEqual(['overdue', 'due-now']);
    });
  });

  describe('exam attempts', () => {
    const start = { examId: EXAM, questionIds: ['q1', 'q2', 'q3'], startedAt: 0, endsAt: 5400000 };

    it('starts an attempt that can be resumed with its saved progress', async () => {
      const id = await repo.startExamAttempt(start);
      await repo.saveExamProgress(id, {
        responses: { q1: ['a'], q2: ['b', 'c'] },
        flagged: ['q2'],
      });

      expect(await repo.getInProgressExamAttempt(EXAM)).toEqual({
        id,
        examId: EXAM,
        status: 'in_progress',
        startedAt: 0,
        endsAt: 5400000,
        submittedAt: null,
        questionIds: ['q1', 'q2', 'q3'],
        responses: { q1: ['a'], q2: ['b', 'c'] },
        flagged: ['q2'],
        correctCount: null,
        totalCount: null,
      });
    });

    it('moves a submitted attempt out of "in progress" and into history', async () => {
      const id = await repo.startExamAttempt(start);
      await repo.submitExamAttempt(id, { submittedAt: 60000, correctCount: 2, totalCount: 3 });

      expect(await repo.getInProgressExamAttempt(EXAM)).toBeNull();
      const history = await repo.getExamHistory(EXAM);
      expect(history).toHaveLength(1);
      expect(history[0]).toMatchObject({
        id,
        status: 'submitted',
        submittedAt: 60000,
        correctCount: 2,
        totalCount: 3,
      });
    });

    it('does not change a submitted attempt when progress is saved late', async () => {
      const id = await repo.startExamAttempt(start);
      await repo.saveExamProgress(id, { responses: { q1: ['a'] }, flagged: [] });
      await repo.submitExamAttempt(id, { submittedAt: 60000, correctCount: 1, totalCount: 3 });

      await repo.saveExamProgress(id, { responses: { q1: ['d'] }, flagged: ['q1'] });

      const attempt = await repo.getExamAttempt(id);
      expect(attempt?.responses).toEqual({ q1: ['a'] });
      expect(attempt?.flagged).toEqual([]);
    });

    it('links exam answers to their attempt', async () => {
      const id = await repo.startExamAttempt(start);
      await repo.recordAnswer(answer({ mode: 'exam', examAttemptId: id }));

      const [saved] = await repo.getRecentAnswers(EXAM, { limit: 1 });
      expect(saved.examAttemptId).toBe(id);
    });
  });

  describe('settings', () => {
    it('returns null for a setting that was never stored', async () => {
      expect(await repo.getSetting('reminderTime')).toBeNull();
    });

    it('stores and overwrites a setting', async () => {
      await repo.setSetting('reminderTime', '08:00');
      await repo.setSetting('reminderTime', '19:30');

      expect(await repo.getSetting('reminderTime')).toBe('19:30');
    });
  });
});
