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
      'review_schedule',
      'settings',
    ]);
    expect(await userVersion(db)).toBe(MIGRATIONS.length);
  });

  it('does nothing when the database is already up to date', async () => {
    const db = createTestDatabase();
    await migrate(db);
    await db.runAsync("INSERT INTO settings (key, value) VALUES ('k', 'v')", []);

    await migrate(db);

    expect(await userVersion(db)).toBe(MIGRATIONS.length);
    expect(await db.getAllAsync('SELECT * FROM settings', [])).toEqual([{ key: 'k', value: 'v' }]);
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
