import { DatabaseSync } from 'node:sqlite';

import type { Database } from '@/db/database';

/** An in-memory SQLite database (Node's built-in driver) behind the app's Database interface. */
export function createTestDatabase(): Database {
  const sqlite = new DatabaseSync(':memory:');
  return {
    async execAsync(source) {
      sqlite.exec(source);
    },
    async runAsync(source, params) {
      const result = sqlite.prepare(source).run(...params);
      return { lastInsertRowId: Number(result.lastInsertRowid), changes: Number(result.changes) };
    },
    async getFirstAsync<T>(source: string, params: (string | number | null)[]) {
      return (sqlite.prepare(source).get(...params) as T | undefined) ?? null;
    },
    async getAllAsync<T>(source: string, params: (string | number | null)[]) {
      return sqlite.prepare(source).all(...params) as T[];
    },
    async withTransactionAsync(task) {
      sqlite.exec('BEGIN');
      try {
        await task();
        sqlite.exec('COMMIT');
      } catch (error) {
        sqlite.exec('ROLLBACK');
        throw error;
      }
    },
  };
}
