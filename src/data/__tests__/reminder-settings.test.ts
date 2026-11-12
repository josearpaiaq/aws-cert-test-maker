import { loadReminderSettings, saveReminderSettings } from '@/data/reminder-settings';
import { createTestDatabase } from '@/db/__tests__/test-database';
import { migrate } from '@/db/migrations';
import { createRepository, type Repository } from '@/db/repository';

describe('reminder settings', () => {
  let repo: Repository;

  beforeEach(async () => {
    const db = createTestDatabase();
    await migrate(db);
    repo = createRepository(db);
  });

  it('defaults to off at 19:00', async () => {
    expect(await loadReminderSettings(repo)).toEqual({
      enabled: false,
      time: { hour: 19, minute: 0 },
    });
  });

  it('round-trips the saved preferences', async () => {
    await saveReminderSettings(repo, { enabled: true, time: { hour: 7, minute: 45 } });

    expect(await loadReminderSettings(repo)).toEqual({
      enabled: true,
      time: { hour: 7, minute: 45 },
    });
  });

  it('falls back to the default time when the stored value is corrupt', async () => {
    await repo.setSetting('reminder.time', 'half past nine');

    expect((await loadReminderSettings(repo)).time).toEqual({ hour: 19, minute: 0 });
  });
});
