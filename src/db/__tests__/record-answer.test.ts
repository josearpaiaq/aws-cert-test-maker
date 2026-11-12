import { migrate } from '@/db/migrations';
import { recordAnswer } from '@/db/record-answer';
import { createRepository, type Repository } from '@/db/repository';

import { createTestDatabase } from './test-database';

const DAY = 24 * 60 * 60 * 1000;
const base = {
  examId: 'clf-c02',
  questionId: 'q1',
  domain: 2,
  mode: 'practice' as const,
  selected: ['a'],
  now: 1_000_000,
};

describe('recordAnswer', () => {
  let repo: Repository;

  beforeEach(async () => {
    const db = createTestDatabase();
    await migrate(db);
    repo = createRepository(db);
  });

  it('stores the answer in the history', async () => {
    await recordAnswer(repo, { ...base, isCorrect: true });

    const [saved] = await repo.getRecentAnswers('clf-c02', { limit: 5 });
    expect(saved).toMatchObject({
      questionId: 'q1',
      domain: 2,
      isCorrect: true,
      answeredAt: 1_000_000,
    });
  });

  it('does not schedule a review for a confident correct answer', async () => {
    await recordAnswer(repo, { ...base, isCorrect: true });

    expect(await repo.getReview('clf-c02', 'q1')).toBeNull();
  });

  it('schedules a missed question for review the next day', async () => {
    await recordAnswer(repo, { ...base, isCorrect: false });

    expect(await repo.getReview('clf-c02', 'q1')).toMatchObject({ dueAt: base.now + DAY });
  });

  it('schedules a low-confidence correct answer for review', async () => {
    await recordAnswer(repo, { ...base, isCorrect: true, confidence: 'low' });

    expect(await repo.getDueReviews('clf-c02', base.now + DAY)).toHaveLength(1);
  });

  it('pushes the next review further out when a scheduled question is answered correctly', async () => {
    await recordAnswer(repo, { ...base, isCorrect: false });
    await recordAnswer(repo, { ...base, isCorrect: true, now: base.now + DAY });
    await recordAnswer(repo, { ...base, isCorrect: true, now: base.now + 2 * DAY });

    expect(await repo.getReview('clf-c02', 'q1')).toMatchObject({
      intervalDays: 6,
      dueAt: base.now + 2 * DAY + 6 * DAY,
    });
  });
});
