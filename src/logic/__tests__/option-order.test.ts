import { optionLetter, orderOptions } from '@/logic/option-order';

const options = ['a', 'b', 'c', 'd'];

describe('orderOptions', () => {
  it('returns every option exactly once', () => {
    expect([...orderOptions(options, 'seed')].sort()).toEqual(options);
  });

  it('gives the same order for the same seed', () => {
    expect(orderOptions(options, 'attempt-7:q1')).toEqual(orderOptions(options, 'attempt-7:q1'));
  });

  it('does not change the array it is given', () => {
    orderOptions(options, 'x');

    expect(options).toEqual(['a', 'b', 'c', 'd']);
  });

  it('puts the correct answer in every position about equally often', () => {
    const positions = [0, 0, 0, 0];
    for (let i = 0; i < 4000; i++) {
      positions[orderOptions(options, `session-${i}:q1`).indexOf('a')] += 1;
    }

    // Each position should get roughly a quarter (1,000) of the 4,000 shuffles.
    for (const count of positions) {
      expect(count).toBeGreaterThan(850);
      expect(count).toBeLessThan(1150);
    }
  });
});

describe('optionLetter', () => {
  it('labels positions A, B, C, D, E', () => {
    expect([0, 1, 2, 3, 4].map(optionLetter)).toEqual(['A', 'B', 'C', 'D', 'E']);
  });
});
