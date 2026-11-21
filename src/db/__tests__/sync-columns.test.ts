import { migrate } from '@/db/migrations';
import { createRepository, resetAtKey, type Repository } from '@/db/repository';

import { createTestDatabase } from './test-database';

type Db = ReturnType<typeof createTestDatabase>;

describe('repository writes for sync', () => {
  let db: Db;
  let repo: Repository;
  let clock: number;

  beforeEach(async () => {
    db = createTestDatabase();
    await migrate(db);
    clock = 1_000;
    repo = createRepository(db, () => clock);
  });

  it('gives new answers and lesson reads a UUID and marks them for upload', async () => {
    await repo.recordAnswer({
      examId: 'clf-c02',
      questionId: 'q1',
      domain: 1,
      mode: 'practice',
      selected: ['a'],
      isCorrect: true,
      answeredAt: 10,
    });
    await repo.markLessonRead('clf-c02', '1.1', 20);
    await repo.markLessonRead('clf-c02', '1.1', 30);

    const rows = await db.getAllAsync<{ uuid: string | null; dirty: number }>(
      'SELECT uuid, dirty FROM answers UNION ALL SELECT uuid, dirty FROM lesson_read_log',
      [],
    );
    expect(rows).toHaveLength(3);
    expect(rows.every((r) => r.uuid !== null && r.dirty === 1)).toBe(true);
    expect(new Set(rows.map((r) => r.uuid)).size).toBe(3);
  });

  it('stamps exam attempts on every change', async () => {
    const id = await repo.startExamAttempt({
      examId: 'clf-c02',
      questionIds: ['q1'],
      startedAt: 100,
      endsAt: 200,
    });
    const row = () =>
      db.getFirstAsync<{ uuid: string; updated_at: number }>(
        'SELECT uuid, updated_at FROM exam_attempts WHERE id = ?',
        [id],
      );
    const { uuid } = (await row())!;
    expect((await row())?.updated_at).toBe(100);

    clock = 150;
    await repo.saveExamProgress(id, { responses: { q1: ['a'] }, flagged: [] });
    expect(await row()).toEqual({ uuid, updated_at: 150 });

    await repo.submitExamAttempt(id, { submittedAt: 180, correctCount: 1, totalCount: 1 });
    expect(await row()).toEqual({ uuid, updated_at: 180 });
  });

  it('stamps settings with the write time and marks them dirty again', async () => {
    await repo.setSetting('reminder.time', '08:00');
    await db.runAsync('UPDATE settings SET dirty = 0', []);

    clock = 2_000;
    await repo.setSetting('reminder.time', '09:00');

    expect(await db.getAllAsync('SELECT key, value, updated_at, dirty FROM settings', [])).toEqual([
      { key: 'reminder.time', value: '09:00', updated_at: 2_000, dirty: 1 },
    ]);
  });

  it('records when progress was reset so the reset can sync', async () => {
    clock = 5_000;
    await repo.resetProgress('clf-c02');
    await expect(repo.getSetting(resetAtKey('clf-c02'))).resolves.toBe('5000');
  });
});
