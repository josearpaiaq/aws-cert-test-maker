import { dayKey, daysAgo, endOfDay, startOfDay } from '@/logic/dates';

// Dates are built from local-time parts so these tests pass in any time zone.
const at = (y: number, m: number, d: number, h = 0, min = 0) =>
  new Date(y, m - 1, d, h, min).getTime();

describe('dayKey', () => {
  it('formats the local calendar day with zero padding', () => {
    expect(dayKey(at(2026, 3, 7, 15))).toBe('2026-03-07');
  });

  it('gives the same key for the first and last minute of a day', () => {
    expect(dayKey(at(2026, 11, 11, 0, 0))).toBe(dayKey(at(2026, 11, 11, 23, 59)));
  });

  it('gives different keys either side of midnight', () => {
    expect(dayKey(at(2026, 11, 11, 23, 59))).not.toBe(dayKey(at(2026, 11, 12, 0, 0)));
  });
});

describe('startOfDay and endOfDay', () => {
  it('bracket the whole local day', () => {
    const noon = at(2026, 11, 11, 12);

    expect(startOfDay(noon)).toBe(at(2026, 11, 11));
    expect(endOfDay(noon)).toBe(at(2026, 11, 12) - 1);
  });
});

describe('daysAgo', () => {
  it('returns midnight of an earlier calendar day', () => {
    expect(daysAgo(at(2026, 11, 11, 18), 3)).toBe(at(2026, 11, 8));
  });

  it('returns today at midnight for zero days', () => {
    expect(daysAgo(at(2026, 11, 11, 18), 0)).toBe(at(2026, 11, 11));
  });

  it('crosses month and year boundaries', () => {
    expect(daysAgo(at(2027, 1, 1, 9), 1)).toBe(at(2026, 12, 31));
  });
});
