import type { Database } from '@/db/database';

/**
 * Schema migrations, applied in order. The database's `PRAGMA user_version` is the number of
 * migrations already applied. Never edit a migration that has shipped; append a new one.
 *
 * Timestamps are Unix epoch milliseconds. Columns ending in `_json` hold JSON text.
 */
export const MIGRATIONS: readonly string[] = [
  `
  CREATE TABLE exam_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exam_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('in_progress', 'submitted')),
    started_at INTEGER NOT NULL,
    ends_at INTEGER NOT NULL,
    submitted_at INTEGER,
    question_ids_json TEXT NOT NULL,
    responses_json TEXT NOT NULL DEFAULT '{}',
    flagged_json TEXT NOT NULL DEFAULT '[]',
    correct_count INTEGER,
    total_count INTEGER
  );
  CREATE INDEX exam_attempts_by_exam ON exam_attempts (exam_id, started_at);

  CREATE TABLE answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exam_id TEXT NOT NULL,
    question_id TEXT NOT NULL,
    domain INTEGER NOT NULL,
    mode TEXT NOT NULL CHECK (mode IN ('practice', 'review', 'exam')),
    selected_json TEXT NOT NULL,
    is_correct INTEGER NOT NULL CHECK (is_correct IN (0, 1)),
    confidence TEXT CHECK (confidence IN ('low', 'high')),
    exam_attempt_id INTEGER REFERENCES exam_attempts (id) ON DELETE CASCADE,
    answered_at INTEGER NOT NULL
  );
  CREATE INDEX answers_by_domain ON answers (exam_id, domain, answered_at);
  CREATE INDEX answers_by_question ON answers (exam_id, question_id, answered_at);

  CREATE TABLE review_schedule (
    exam_id TEXT NOT NULL,
    question_id TEXT NOT NULL,
    due_at INTEGER NOT NULL,
    interval_days REAL NOT NULL,
    ease_factor REAL NOT NULL,
    repetitions INTEGER NOT NULL,
    last_reviewed_at INTEGER NOT NULL,
    PRIMARY KEY (exam_id, question_id)
  );
  CREATE INDEX review_schedule_due ON review_schedule (exam_id, due_at);

  CREATE TABLE settings (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL
  );
  `,
  `
  CREATE TABLE lesson_reads (
    exam_id TEXT NOT NULL,
    lesson_id TEXT NOT NULL,
    read_at INTEGER NOT NULL,
    PRIMARY KEY (exam_id, lesson_id)
  );
  `,
];

/** Brings the database up to the latest schema version. Safe to call on every app start. */
export async function migrate(
  db: Database,
  migrations: readonly string[] = MIGRATIONS,
): Promise<void> {
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version', []);
  let version = row?.user_version ?? 0;

  if (version > migrations.length) {
    throw new Error(
      `Database is at version ${version}, but this app only knows ${migrations.length} migrations`,
    );
  }

  while (version < migrations.length) {
    const next = version + 1;
    await db.withTransactionAsync(async () => {
      await db.execAsync(migrations[version]);
      await db.execAsync(`PRAGMA user_version = ${next}`);
    });
    version = next;
  }
}
