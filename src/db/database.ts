export type SqlParam = string | number | null;

/**
 * The subset of expo-sqlite's `SQLiteDatabase` that the data layer uses. Depending on this
 * interface instead of the native module lets the same SQL run against Node's built-in
 * SQLite in unit tests.
 */
export interface Database {
  execAsync(source: string): Promise<void>;
  runAsync(
    source: string,
    params: SqlParam[],
  ): Promise<{ lastInsertRowId: number; changes: number }>;
  getFirstAsync<T>(source: string, params: SqlParam[]): Promise<T | null>;
  getAllAsync<T>(source: string, params: SqlParam[]): Promise<T[]>;
  withTransactionAsync(task: () => Promise<void>): Promise<void>;
}
