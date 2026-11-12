import { formatClock, remainingMs } from '@/logic/exam-clock';

describe('remainingMs', () => {
  it('is the time between now and the end', () => {
    expect(remainingMs(10_000, 4_000)).toBe(6_000);
  });

  it('is zero at the end time and after it', () => {
    expect(remainingMs(10_000, 10_000)).toBe(0);
    expect(remainingMs(10_000, 99_000)).toBe(0);
  });

  it('depends only on timestamps, so a long gap between checks is counted in full', () => {
    const endsAt = 90 * 60_000;
    const afterTwoMinutesInBackground = 2 * 60_000;

    expect(remainingMs(endsAt, afterTwoMinutesInBackground)).toBe(88 * 60_000);
  });
});

describe('formatClock', () => {
  it.each([
    [90 * 60_000, '90:00'],
    [89 * 60_000 + 59_000, '89:59'],
    [61_000, '01:01'],
    [60_000, '01:00'],
    [9_000, '00:09'],
    [0, '00:00'],
  ])('formats %i ms as %s', (ms, text) => {
    expect(formatClock(ms)).toBe(text);
  });

  it('rounds partial seconds up', () => {
    expect(formatClock(59_001)).toBe('01:00');
    expect(formatClock(1)).toBe('00:01');
  });

  it('never shows a negative time', () => {
    expect(formatClock(-5_000)).toBe('00:00');
  });
});
