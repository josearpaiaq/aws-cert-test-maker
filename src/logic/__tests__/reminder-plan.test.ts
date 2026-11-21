import { planReminders, REMINDER_DAYS } from '@/logic/reminder-plan';
import type { Streak } from '@/logic/streak';

const TIME = { hour: 19, minute: 0 };
const at = (d: number, h: number, m = 0) => new Date(2026, 10, d, h, m).getTime();
const streak = (overrides: Partial<Streak>): Streak => ({
  current: 0,
  studiedToday: false,
  best: 0,
  freezes: 0,
  daysToNextFreeze: 7,
  week: [],
  ...overrides,
});

describe('planReminders', () => {
  it('plans one reminder a day at the chosen time, starting today', () => {
    const plan = planReminders(TIME, streak({}), at(11, 9));

    expect(plan).toHaveLength(REMINDER_DAYS);
    expect(plan[0].at).toBe(at(11, 19));
    expect(plan[6].at).toBe(at(17, 19));
    expect(plan.every((r) => r.title === 'Time to study')).toBe(true);
  });

  it("warns that today's streak is at stake before studying", () => {
    const [first, second] = planReminders(TIME, streak({ current: 5 }), at(11, 9));

    expect(first).toMatchObject({ at: at(11, 19), title: '🔥 Your 5-day streak ends tonight' });
    expect(second.title).toBe('Time to study');
  });

  it('skips today after studying and names the streak tomorrow', () => {
    const [first] = planReminders(TIME, streak({ current: 5, studiedToday: true }), at(11, 9));

    expect(first).toMatchObject({ at: at(12, 19), title: '🔥 Keep your 5-day streak going' });
  });

  it("starts tomorrow once today's time has passed", () => {
    const [first] = planReminders(TIME, streak({ current: 5 }), at(11, 20));

    // Today is missed by then, so the streak is not promised.
    expect(first).toMatchObject({ at: at(12, 19), title: 'Time to study' });
  });
});
