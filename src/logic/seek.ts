/** The playback position, in seconds, for a touch at `x` on a seek bar `width` points wide. */
export function positionFromTouch(x: number, width: number, duration: number): number {
  if (width <= 0 || duration <= 0) return 0;
  return Math.min(duration, Math.max(0, (x / width) * duration));
}

/** A position moved by `step` seconds, kept inside the track. */
export function stepPosition(current: number, step: number, duration: number): number {
  return Math.min(Math.max(0, duration), Math.max(0, current + step));
}
