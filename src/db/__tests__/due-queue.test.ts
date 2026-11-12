import { CLF_C02 } from '@/data/exams/clf-c02';
import { DUE_TARGET, loadDueQuestions, loadPracticeQuestions } from '@/data/practice-questions';
import { getQuestionBank } from '@/data/question-bank';
import { startExam, submitExam } from '@/db/exam-attempts';
import { migrate } from '@/db/migrations';
import { recordAnswer } from '@/db/record-answer';
import { createRepository, type Repository } from '@/db/repository';

import { createTestDatabase } from './test-database';

/** A local time on a day of November 2026, so the tests pass in any time zone. */
const on = (day: number, hour = 12, minute = 0) => new Date(2026, 10, day, hour, minute).getTime();

const [first, second, third] = getQuestionBank();

describe('"Due today" queue', () => {
  let repo: Repository;

  beforeEach(async () => {
    const db = createTestDatabase();
    await migrate(db);
    repo = createRepository(db);
  });

  const answer = (
    question: typeof first,
    now: number,
    result: { isCorrect: boolean; confidence?: 'low' | 'high' },
  ) =>
    recordAnswer(repo, {
      examId: CLF_C02.id,
      questionId: question.id,
      domain: question.domain,
      mode: 'practice',
      selected: result.isCorrect ? question.correct : [],
      now,
      ...result,
    });

  const dueIds = async (now: number) => (await loadDueQuestions(repo, now)).map((q) => q.id);

  it('is empty before anything has been answered', async () => {
    expect(await dueIds(on(10))).toEqual([]);
  });

  it('does not show a missed question again on the same day', async () => {
    await answer(first, on(10, 9), { isCorrect: false });

    expect(await dueIds(on(10, 22))).toEqual([]);
  });

  it("shows a question missed yesterday in today's queue", async () => {
    await answer(first, on(10, 9), { isCorrect: false });

    expect(await dueIds(on(11, 8))).toEqual([first.id]);
  });

  it('counts a question as due all day, even before the exact 24 hours have passed', async () => {
    await answer(first, on(10, 23, 30), { isCorrect: false });

    expect(await dueIds(on(11, 7))).toEqual([first.id]);
  });

  it('never queues a question answered correctly and confidently', async () => {
    await answer(first, on(10), { isCorrect: true });

    expect(await dueIds(on(11))).toEqual([]);
    expect(await dueIds(on(30))).toEqual([]);
  });

  it('queues a correct answer that was marked as unsure', async () => {
    await answer(first, on(10), { isCorrect: true, confidence: 'low' });

    expect(await dueIds(on(11))).toEqual([first.id]);
  });

  it('keeps an unreviewed question in the queue on later days', async () => {
    await answer(first, on(10), { isCorrect: false });

    expect(await dueIds(on(14))).toEqual([first.id]);
  });

  it('spaces a question out further each time it is reviewed correctly', async () => {
    await answer(first, on(10), { isCorrect: false });
    await answer(first, on(11), { isCorrect: true });

    // First successful review: back the next day.
    expect(await dueIds(on(11, 20))).toEqual([]);
    expect(await dueIds(on(12))).toEqual([first.id]);

    // Second successful review: back six days later.
    await answer(first, on(12), { isCorrect: true });
    expect(await dueIds(on(13))).toEqual([]);
    expect(await dueIds(on(17))).toEqual([]);
    expect(await dueIds(on(18))).toEqual([first.id]);
  });

  it('brings a question back the next day when a review is missed again', async () => {
    await answer(first, on(10), { isCorrect: false });
    await answer(first, on(11), { isCorrect: true });
    await answer(first, on(12), { isCorrect: true });
    await answer(first, on(18), { isCorrect: false });

    expect(await dueIds(on(18, 20))).toEqual([]);
    expect(await dueIds(on(19))).toEqual([first.id]);
  });

  it('lists the most overdue question first', async () => {
    await answer(second, on(9), { isCorrect: false });
    await answer(first, on(7), { isCorrect: false });
    await answer(third, on(8), { isCorrect: false });

    expect(await dueIds(on(11))).toEqual([first.id, third.id, second.id]);
  });

  it('includes questions missed in a mock exam', async () => {
    const bank = getQuestionBank();
    const id = await startExam(repo, CLF_C02, bank, on(10));
    await repo.saveExamProgress(id, { responses: { [first.id]: first.correct }, flagged: [] });
    const attempt = await repo.getInProgressExamAttempt(CLF_C02.id);
    if (!attempt) throw new Error('expected an attempt');

    await submitExam(repo, attempt, bank, on(10, 14));

    const due = await dueIds(on(11));
    expect(due).not.toContain(first.id);
    expect(due).toHaveLength(bank.length - 1);
  });

  it('caps one review session at 20 questions, most overdue first', async () => {
    const bank = getQuestionBank();
    for (const [i, question] of bank.slice(0, 25).entries()) {
      await answer(question, on(1, 0, i), { isCorrect: false });
    }

    const session = await loadPracticeQuestions(repo, DUE_TARGET, on(11));

    expect(session).toHaveLength(20);
    expect(session[0].id).toBe(bank[0].id);
    expect(await dueIds(on(11))).toHaveLength(25);
  });
});
