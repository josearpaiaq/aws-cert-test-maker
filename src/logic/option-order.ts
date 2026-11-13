import { shuffle, type Random } from '@/logic/random';

/** A 32-bit FNV-1a hash of a string, used to seed the shuffle. */
function hash(text: string): number {
  let value = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    value ^= text.charCodeAt(i);
    value = Math.imul(value, 0x01000193);
  }
  return value >>> 0;
}

/** mulberry32: a small, fast pseudo-random generator that is good enough for shuffling. */
function seededRandom(seed: number): Random {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * The options in a shuffled order that depends only on `seed`, so the same seed always gives
 * the same order (a resumed exam looks the same) while different seeds spread the correct
 * answer across all positions.
 */
export function orderOptions<T>(options: readonly T[], seed: string): T[] {
  return shuffle(options, seededRandom(hash(seed)));
}

/** The letter shown for the option at `index`: A, B, C, ... */
export function optionLetter(index: number): string {
  return String.fromCharCode(65 + index);
}
