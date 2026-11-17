import { positionFromTouch, stepPosition } from '@/logic/seek';

describe('positionFromTouch', () => {
  it('maps the touch across the bar to the track length', () => {
    expect(positionFromTouch(0, 200, 300)).toBe(0);
    expect(positionFromTouch(100, 200, 300)).toBe(150);
    expect(positionFromTouch(200, 200, 300)).toBe(300);
  });

  it('clamps touches dragged past either end', () => {
    expect(positionFromTouch(-40, 200, 300)).toBe(0);
    expect(positionFromTouch(260, 200, 300)).toBe(300);
  });

  it('returns 0 before the bar or the track has a size', () => {
    expect(positionFromTouch(50, 0, 300)).toBe(0);
    expect(positionFromTouch(50, 200, 0)).toBe(0);
  });
});

describe('stepPosition', () => {
  it('moves forward and back by the step', () => {
    expect(stepPosition(60, 15, 300)).toBe(75);
    expect(stepPosition(60, -15, 300)).toBe(45);
  });

  it('stays inside the track', () => {
    expect(stepPosition(5, -15, 300)).toBe(0);
    expect(stepPosition(295, 15, 300)).toBe(300);
  });
});
