import { migrate, MIGRATIONS } from '@/db/migrations';

import { createTestDatabase } from './test-database';

async function userVersion(db: ReturnType<typeof createTestDatabase>) {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version', []);
  return row?.user_version;
}

describe('migrate', () => {
  it('creates every table on a fresh database and records the version', async () => {
    const db = createTestDatabase();
    await migrate(db);

    const tables = await db.getAllAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
      [],
    );
    expect(tables.map((t) => t.name)).toEqual([
      'answers',
      'exam_attempts',
      'lesson_read_log',
      'lesson_reads',
      'review_schedule',
      'settings',
      'sync_state',
    ]);
    expect(await userVersion(db)).toBe(MIGRATIONS.length);
  });

  it('upgrades a version 1 database without losing its data', async () => {
    const db = createTestDatabase();
    await migrate(db, MIGRATIONS.slice(0, 1));
    await db.runAsync("INSERT INTO settings (key, value) VALUES ('reminder.time', '08:00')", []);

    await migrate(db);

    expect(await userVersion(db)).toBe(MIGRATIONS.length);
    expect(await db.getAllAsync('SELECT value FROM settings', [])).toEqual([{ value: '08:00' }]);
    expect(await db.getAllAsync('SELECT * FROM lesson_reads', [])).toEqual([]);
  });

  it('copies earlier lesson reads into the read log when upgrading from version 2', async () => {
    const db = createTestDatabase();
    await migrate(db, MIGRATIONS.slice(0, 2));
    await db.runAsync(
      "INSERT INTO lesson_reads (exam_id, lesson_id, read_at) VALUES ('clf-c02', '3.6', 1234)",
      [],
    );

    await migrate(db);

    expect(
      await db.getAllAsync('SELECT exam_id, lesson_id, read_at FROM lesson_read_log', []),
    ).toEqual([{ exam_id: 'clf-c02', lesson_id: '3.6', read_at: 1234 }]);
  });

  describe('upgrading from version 3 (before sync)', () => {
    const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

    async function v3WithData() {
      const db = createTestDatabase();
      await migrate(db, MIGRATIONS.slice(0, 3));
      await db.execAsync(`
        INSERT INTO exam_attempts (exam_id, status, started_at, ends_at, submitted_at,
          question_ids_json, correct_count, total_count)
        VALUES ('clf-c02', 'submitted', 100, 200, 150, '["q1"]', 1, 1),
               ('clf-c02', 'in_progress', 300, 400, NULL, '["q2"]', NULL, NULL);
        INSERT INTO answers (exam_id, question_id, domain, mode, selected_json, is_correct,
          exam_attempt_id, answered_at)
        VALUES ('clf-c02', 'q1', 1, 'exam', '["a"]', 1, 1, 150),
               ('clf-c02', 'q1', 1, 'practice', '["b"]', 0, NULL, 160),
               ('clf-c02', 'q2', 2, 'review', '["c"]', 1, NULL, 170);
        INSERT INTO lesson_read_log (exam_id, lesson_id, read_at) VALUES ('clf-c02', '1.1', 50);
        INSERT INTO settings (key, value) VALUES ('reminder.time', '08:00');
      `);
      await migrate(db);
      return db;
    }

    it('keeps every answer, exam, lesson read and setting', async () => {
      const db = await v3WithData();
      expect(await db.getAllAsync('SELECT question_id, answered_at FROM answers', [])).toEqual([
        { question_id: 'q1', answered_at: 150 },
        { question_id: 'q1', answered_at: 160 },
        { question_id: 'q2', answered_at: 170 },
      ]);
      expect(
        await db.getAllAsync('SELECT status, updated_at FROM exam_attempts ORDER BY id', []),
      ).toEqual([
        { status: 'submitted', updated_at: 150 },
        { status: 'in_progress', updated_at: 300 },
      ]);
      expect(await db.getAllAsync('SELECT lesson_id FROM lesson_read_log', [])).toEqual([
        { lesson_id: '1.1' },
      ]);
      expect(await db.getAllAsync('SELECT key, value FROM settings', [])).toEqual([
        { key: 'reminder.time', value: '08:00' },
      ]);
    });

    it('gives every existing row a distinct UUID and marks it for upload', async () => {
      const db = await v3WithData();
      const rows = await db.getAllAsync<{ uuid: string; dirty: number }>(
        `SELECT uuid, dirty FROM answers
         UNION ALL SELECT uuid, dirty FROM exam_attempts
         UNION ALL SELECT uuid, dirty FROM lesson_read_log`,
        [],
      );
      expect(rows).toHaveLength(6);
      for (const row of rows) {
        expect(row.uuid).toMatch(UUID_V4);
        expect(row.dirty).toBe(1);
      }
      expect(new Set(rows.map((r) => r.uuid)).size).toBe(6);
      expect(await db.getAllAsync('SELECT dirty FROM settings', [])).toEqual([{ dirty: 1 }]);
    });

    it('creates the sync state with a device id and no cursor', async () => {
      const db = await v3WithData();
      const state = await db.getFirstAsync<{ device_id: string; cursor: number }>(
        'SELECT device_id, cursor FROM sync_state',
        [],
      );
      expect(state?.device_id).toMatch(UUID_V4);
      expect(state?.cursor).toBe(0);
      await expect(
        db.runAsync("INSERT INTO sync_state (id, device_id) VALUES (2, 'x')", []),
      ).rejects.toThrow(/CHECK/);
    });

    it('rejects duplicate UUIDs', async () => {
      const db = await v3WithData();
      await expect(
        db.runAsync('UPDATE answers SET uuid = (SELECT uuid FROM answers WHERE id = 1)', []),
      ).rejects.toThrow(/UNIQUE/);
    });
  });

  it('does nothing when the database is already up to date', async () => {
    const db = createTestDatabase();
    await migrate(db);
    await db.runAsync("INSERT INTO settings (key, value) VALUES ('k', 'v')", []);

    await migrate(db);

    expect(await userVersion(db)).toBe(MIGRATIONS.length);
    expect(await db.getAllAsync('SELECT key, value FROM settings', [])).toEqual([
      { key: 'k', value: 'v' },
    ]);
  });

  it('rolls back a failed migration and leaves the version unchanged', async () => {
    const db = createTestDatabase();
    await migrate(db);
    // Pretend the app shipped a second migration that fails halfway through.
    const broken = [...MIGRATIONS, 'CREATE TABLE extra (id INTEGER); CREATE TABLE settings (x);'];

    await expect(migrate(db, broken)).rejects.toThrow(/settings/);

    expect(await userVersion(db)).toBe(MIGRATIONS.length);
    const extra = await db.getAllAsync("SELECT name FROM sqlite_master WHERE name = 'extra'", []);
    expect(extra).toEqual([]);
  });

  it('refuses to open a database written by a newer app version', async () => {
    const db = createTestDatabase();
    await db.execAsync(`PRAGMA user_version = ${MIGRATIONS.length + 1}`);

    await expect(migrate(db)).rejects.toThrow(/only knows/);
  });

  it('enforces the constraints the schema declares', async () => {
    const db = createTestDatabase();
    await migrate(db);

    await expect(
      db.runAsync(
        `INSERT INTO answers (exam_id, question_id, domain, mode, selected_json, is_correct, answered_at)
         VALUES ('clf-c02', 'q1', 1, 'bogus', '[]', 1, 0)`,
        [],
      ),
    ).rejects.toThrow(/CHECK/);
  });
});
