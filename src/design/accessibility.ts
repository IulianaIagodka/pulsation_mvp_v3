/** Cap scaling at iOS Accessibility XXL (~3.1× default body). */
export const MAX_FONT_SIZE_MULTIPLIER = 3.1;

export type LegibleTone = "hint" | "muted" | "faint";

const OPACITY_FLOOR: Record<LegibleTone, number> = {
  hint: 0.58,
  muted: 0.72,
  faint: 0.62,
};

const OPACITY_FLOOR_HIGH_CONTRAST: Record<LegibleTone, number> = {
  hint: 0.88,
  muted: 0.92,
  faint: 0.85,
};

/** Keeps soft copy readable on dark UI and in bright / high-contrast conditions. */
export function legibleOpacity(requested: number, highContrast: boolean, tone: LegibleTone): number {
  const floor = highContrast ? OPACITY_FLOOR_HIGH_CONTRAST[tone] : OPACITY_FLOOR[tone];
  return Math.max(floor, requested);
}
