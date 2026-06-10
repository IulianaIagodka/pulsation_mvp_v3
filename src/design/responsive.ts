import { spacing } from "./tokens";

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

/** Matches `CalmScreen` container horizontal padding. */
export function getCalmScreenHorizontalPadding(windowWidth: number): number {
  return Math.round(Math.max(spacing.md, Math.min(spacing.xl, windowWidth * 0.06)));
}

/** CalmScreen side padding + main anchor slot + scroll safety margin. */
export function getFlowScreenHorizontalInset(windowWidth: number): number {
  return getCalmScreenHorizontalPadding(windowWidth) * 2 + spacing.sm * 2 + spacing.xs * 2;
}

/** Readable copy width for flow screens — explicit px so Text wraps under large type. */
export function getFlowCopyTextWidth(
  windowWidth: number,
  insets: { left: number; right: number },
  extraHorizontalPadding?: number,
): number {
  const padding = extraHorizontalPadding ?? getFlowScreenHorizontalInset(windowWidth);
  return Math.max(0, Math.round(windowWidth - insets.left - insets.right - padding));
}
