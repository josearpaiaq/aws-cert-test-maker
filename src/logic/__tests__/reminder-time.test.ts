import { formatReminderTime, parseReminderTime } from '@/logic/reminder-time';

describe('formatReminderTime', () => {
  it('pads hours and minutes to two digits', () => {
    expect(formatReminderTime({ hour: 7, minute: 5 })).toBe('07:05');
    expect(formatReminderTime({ hour: 19, minute: 30 })).toBe('19:30');
  });
});

describe('parseReminderTime', () => {
  it('reads back what formatReminderTime wrote', () => {
    expect(parseReminderTime(formatReminderTime({ hour: 0, minute: 0 }))).toEqual({
      hour: 0,
      minute: 0,
    });
    expect(parseReminderTime('23:59')).toEqual({ hour: 23, minute: 59 });
  });

  it.each([null, '', '7:05', '24:00', '12:60', '12:5', 'ab:cd', '12:30:00'])(
    'rejects %p',
    (value) => {
      expect(parseReminderTime(value)).toBeNull();
    },
  );
});
