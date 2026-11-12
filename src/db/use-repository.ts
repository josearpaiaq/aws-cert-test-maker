import { useSQLiteContext } from 'expo-sqlite';
import { useMemo } from 'react';

import { createRepository, type Repository } from '@/db/repository';

/** The typed repository for the app database. Must be used inside `SQLiteProvider`. */
export function useRepository(): Repository {
  const db = useSQLiteContext();
  return useMemo(() => createRepository(db), [db]);
}
