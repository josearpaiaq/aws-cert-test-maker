import { CLF_C02 } from '@/data/exams/clf-c02';
import { loadProgress } from '@/data/progress';
import { createTestDatabase } from '@/db/__tests__/test-database';
import { migrate } from '@/db/migrations';
import { createRepository, type Repository } from '@/db/repository';

const EXAM = CLF_C02.id;
const on = (day: number, hour = 12) => new Date(2026, 10, day, hour).getTime();

describe('loadProgress streak', () => {
  let repo: Repository;

  beforeEach(async () => {
    const db = createTestDatabase();
    await migrate(db);
    repo = createRepository(db);
  });

  const answer = (day: number) =>
    repo.recordAnswer({
      examId: EXAM,
      questionId: 'q1',
      domain: 1,
      mode: 'practice',
      selected: ['a'],
      isCorrect: true,
      answeredAt: on(day),
    });

  it('counts a day with only a lesson read as a study day', async () => {
    await answer(14);
    await repo.markLessonRead(EXAM, '3.6', on(15));
    await answer(16);

    const progress = await loadProgress(repo, on(16, 20));

    expect(progress.streak).toEqual({ current: 3, studiedToday: true });
  });

  it('keeps the streak alive when a lesson is re-read on a later day', async () => {
    await repo.markLessonRead(EXAM, '3.6', on(15));
    await repo.markLessonRead(EXAM, '3.6', on(16));

    const progress = await loadProgress(repo, on(16, 20));

    expect(progress.streak.current).toBe(2);
  });

  it('does not count lesson reads as answered questions', async () => {
    await answer(16);
    await repo.markLessonRead(EXAM, '3.6', on(16));

    expect((await loadProgress(repo, on(16, 20))).totalAnswered).toBe(1);
  });
});
