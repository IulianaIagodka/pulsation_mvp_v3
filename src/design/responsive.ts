export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Scale values around a 390pt baseline (iPhone 14/15/16). */
export function scaleByWidth(baseValue: number, windowWidth: number): number {
  const factor = clamp(windowWidth / 390, 0.9, 1.15);
  return Math.round(baseValue * factor);
}

/** Keep long text readable on large phones and tablets. */
export function getContentMaxWidth(windowWidth: number): number {
  return Math.round(clamp(windowWidth * 0.92, 320, 440));
}
