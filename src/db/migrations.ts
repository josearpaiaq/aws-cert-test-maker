import type { Database } from '@/db/database';

/**
 * SQL expression for a random RFC 4122 version 4 UUID. Used to backfill existing rows and to
 * give every new syncable row its global identity.
 */
export const UUID_SQL = `(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' ||
  substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', 1 + (abs(random()) % 4), 1) ||
  substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6))))`;

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
  `
  CREATE TABLE lesson_read_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exam_id TEXT NOT NULL,
    lesson_id TEXT NOT NULL,
    read_at INTEGER NOT NULL
  );
  CREATE INDEX lesson_read_log_by_exam ON lesson_read_log (exam_id, read_at);
  INSERT INTO lesson_read_log (exam_id, lesson_id, read_at)
    SELECT exam_id, lesson_id, read_at FROM lesson_reads;
  `,
  // Sync. `uuid` is a row's identity across devices (local integer ids collide). `dirty = 1`
  // means the row changed on this device and has not been accepted by the server yet; rows
  // pulled from the server are stored clean. `updated_at` orders edits of mutable rows.
  // review_schedule and lesson_reads are not synced: they are rebuilt from answers and the
  // lesson read log.
  `
  ALTER TABLE answers ADD COLUMN uuid TEXT;
  ALTER TABLE answers ADD COLUMN dirty INTEGER NOT NULL DEFAULT 1 CHECK (dirty IN (0, 1));
  UPDATE answers SET uuid = ${UUID_SQL};
  CREATE UNIQUE INDEX answers_by_uuid ON answers (uuid);

  ALTER TABLE exam_attempts ADD COLUMN uuid TEXT;
  ALTER TABLE exam_attempts ADD COLUMN updated_at INTEGER NOT NULL DEFAULT 0;
  ALTER TABLE exam_attempts ADD COLUMN dirty INTEGER NOT NULL DEFAULT 1 CHECK (dirty IN (0, 1));
  UPDATE exam_attempts SET uuid = ${UUID_SQL}, updated_at = COALESCE(submitted_at, started_at);
  CREATE UNIQUE INDEX exam_attempts_by_uuid ON exam_attempts (uuid);

  ALTER TABLE lesson_read_log ADD COLUMN uuid TEXT;
  ALTER TABLE lesson_read_log ADD COLUMN dirty INTEGER NOT NULL DEFAULT 1 CHECK (dirty IN (0, 1));
  UPDATE lesson_read_log SET uuid = ${UUID_SQL};
  CREATE UNIQUE INDEX lesson_read_log_by_uuid ON lesson_read_log (uuid);

  ALTER TABLE settings ADD COLUMN updated_at INTEGER NOT NULL DEFAULT 0;
  ALTER TABLE settings ADD COLUMN dirty INTEGER NOT NULL DEFAULT 1 CHECK (dirty IN (0, 1));

  CREATE TABLE sync_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    device_id TEXT NOT NULL,
    cursor INTEGER NOT NULL DEFAULT 0,
    last_synced_at INTEGER
  );
  INSERT INTO sync_state (id, device_id) VALUES (1, ${UUID_SQL});
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
