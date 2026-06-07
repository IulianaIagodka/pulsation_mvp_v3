/** Do not shrink below app default when the system text size is xSmall / minimum. */
export const MIN_FONT_SIZE_MULTIPLIER = 1;

/** Cap scaling at iOS Accessibility XXL (~3.1× default body). */
export const MAX_FONT_SIZE_MULTIPLIER = 3.1;

export function clampFontScale(raw: number): number {
  return Math.min(MAX_FONT_SIZE_MULTIPLIER, Math.max(MIN_FONT_SIZE_MULTIPLIER, raw));
}
