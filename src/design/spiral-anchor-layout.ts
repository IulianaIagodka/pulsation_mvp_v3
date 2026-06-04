import { PixelRatio } from "react-native";
import { breathingRhythm, spiralLayout } from "./animation-rhythm";
import { MAX_FONT_SIZE_MULTIPLIER } from "./accessibility";
import { clamp, scaleByWidth } from "./responsive";
import { spacing } from "./tokens";

export type SpiralAnchorMetrics = {
  contentHeight: number;
  scrollHeight: number;
  spiralCenterY: number;
  spiralBottomY: number;
};

/** Layout anchor in scroll coordinates (below top safe area). */
export function getSpiralAnchorMetrics(
  windowHeight: number,
  insets: { top: number; bottom: number },
): SpiralAnchorMetrics {
  const contentHeight = windowHeight - insets.top - insets.bottom;
  const scrollHeight = windowHeight - insets.top;
  const spiralCenterY = contentHeight * spiralLayout.anchorRatio;
  const spiralBottomY = spiralCenterY + spiralLayout.size / 2;
  return { contentHeight, scrollHeight, spiralCenterY, spiralBottomY };
}

/** Extra space below the spiral layout box during inhale scale + shadow. */
export function getSpiralBreathBottomOverflow(windowWidth: number): number {
  const { size } = spiralLayout;
  const { scaleInhale } = breathingRhythm.spiral;
  const scaleOverflow = (size / 2) * (scaleInhale - 1);
  const shadowSlack = scaleByWidth(10, windowWidth);
  return scaleOverflow + shadowSlack;
}

/** Reserved height for inline hint below main copy (includes top margin). */
export function getInlineHintSlotHeight(windowWidth: number, fontScale = PixelRatio.getFontScale()): number {
  const capped = Math.min(fontScale, MAX_FONT_SIZE_MULTIPLIER);
  const lineHeight = clamp(Math.round(scaleByWidth(22, windowWidth) * capped), 20, 48);
  return lineHeight + scaleByWidth(spacing.sm, windowWidth) * 2;
}

/** Fixed slot for the primary main line — shared across flow screens. */
export function getMainCopySlotHeight(windowWidth: number, fontScale = PixelRatio.getFontScale()): number {
  const capped = Math.min(fontScale, MAX_FONT_SIZE_MULTIPLIER);
  return clamp(Math.round(scaleByWidth(52, windowWidth) * capped), 52, 88);
}

/** Vertical center of the full display, in scroll coordinates (below top safe area). */
export function getScreenEquatorY(
  windowHeight: number,
  insets: { top: number; bottom: number },
): number {
  return windowHeight / 2 - insets.top;
}

/** Main line Y — shared across flow screens (no under-spiral hint gap). */
export function getTriggerMainCopyTop(
  metrics: SpiralAnchorMetrics,
  windowWidth: number,
): number {
  return getContentZoneTopWithoutHint(metrics, windowWidth);
}

/** Return follow-up — below pinned main line slot. */
export function getReturnFollowUpTop(
  metrics: SpiralAnchorMetrics,
  windowWidth: number,
  fontScale = PixelRatio.getFontScale(),
): number {
  const mainTop = getTriggerMainCopyTop(metrics, windowWidth);
  const mainSlotHeight = getMainCopySlotHeight(windowWidth, fontScale);
  const gap = scaleByWidth(16, windowWidth);
  return mainTop + mainSlotHeight + gap;
}

/** Top of main copy below the spiral. */
export function getContentZoneTopWithoutHint(
  metrics: SpiralAnchorMetrics,
  windowWidth: number,
): number {
  const gap = scaleByWidth(spiralLayout.textGap, windowWidth);
  return metrics.spiralBottomY + getSpiralBreathBottomOverflow(windowWidth) + gap;
}
