import { PixelRatio } from "react-native";
import { breathingRhythm, circlesLayout } from "./animation-rhythm";
import { MAX_FONT_SIZE_MULTIPLIER } from "./accessibility";
import { clamp, scaleByWidth } from "./responsive";
import { spacing } from "./tokens";

export type CirclesAnchorMetrics = {
  contentHeight: number;
  scrollHeight: number;
  circlesCenterY: number;
  circlesBottomY: number;
};

/** Layout anchor in scroll coordinates (below top safe area). */
export function getCirclesAnchorMetrics(
  windowHeight: number,
  insets: { top: number; bottom: number },
): CirclesAnchorMetrics {
  const contentHeight = windowHeight - insets.top - insets.bottom;
  const scrollHeight = windowHeight - insets.top;
  const circlesCenterY = contentHeight * circlesLayout.anchorRatio;
  const circlesBottomY = circlesCenterY + circlesLayout.size / 2;
  return { contentHeight, scrollHeight, circlesCenterY, circlesBottomY };
}

/** Extra space below circles layout box during inhale scale + shadow. */
export function getCirclesBreathBottomOverflow(windowWidth: number): number {
  const { size } = circlesLayout;
  const { scaleInhale } = breathingRhythm.circles;
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

/** Fixed slot under circles — same on every flow screen (not scaled by Dynamic Type). */
export function getUnderCirclesHintSlotHeight(windowWidth: number): number {
  const lineHeight = scaleByWidth(18, windowWidth);
  const marginTop = scaleByWidth(spacing.xs, windowWidth);
  return lineHeight + marginTop;
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

/** Main line Y — shared across flow screens (no under-circles hint gap). */
export function getTriggerMainCopyTop(
  metrics: CirclesAnchorMetrics,
  windowWidth: number,
): number {
  return getContentZoneTopWithoutHint(metrics, windowWidth);
}

/** Return follow-up — below pinned main line slot. */
export function getReturnFollowUpTop(
  metrics: CirclesAnchorMetrics,
  windowWidth: number,
  fontScale = PixelRatio.getFontScale(),
): number {
  const mainTop = getTriggerMainCopyTop(metrics, windowWidth);
  const mainSlotHeight = getMainCopySlotHeight(windowWidth, fontScale);
  const gap = scaleByWidth(16, windowWidth);
  return mainTop + mainSlotHeight + gap;
}

/** Top of main copy below circles block (rings + fixed under-circles hint slot). */
export function getContentZoneTopWithoutHint(
  metrics: CirclesAnchorMetrics,
  windowWidth: number,
): number {
  const gap = scaleByWidth(circlesLayout.textGap, windowWidth);
  return (
    metrics.circlesBottomY +
    getCirclesBreathBottomOverflow(windowWidth) +
    getUnderCirclesHintSlotHeight(windowWidth) +
    gap
  );
}
