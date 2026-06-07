import { breathingRhythm, circlesLayout } from "./animation-rhythm";
import { getCappedFontScale } from "./accessibility";
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
  // outerHighlighted: shadowRadius 18 + shadowOffset.y 6
  const shadowSlack = scaleByWidth(16, windowWidth);
  return scaleOverflow + shadowSlack;
}

/** Gap between circles block and tap hint — clears max inhale diameter + shadow. */
export function getCirclesToHintGap(windowWidth: number): number {
  return getCirclesBreathBottomOverflow(windowWidth) + scaleByWidth(4, windowWidth);
}

/** Reserved height for inline hint below main copy (includes top margin). */
export function getInlineHintSlotHeight(windowWidth: number, fontScale = getCappedFontScale()): number {
  const capped = getCappedFontScale(fontScale);
  const lineHeight = clamp(Math.round(scaleByWidth(22, windowWidth) * capped), 20, 48);
  return lineHeight + scaleByWidth(spacing.sm, windowWidth) * 2;
}

/** Fixed text line under circles — same on every flow screen (not scaled by Dynamic Type). */
export function getUnderCirclesHintSlotHeight(windowWidth: number): number {
  return scaleByWidth(14, windowWidth);
}

/** Full reserved block: gap + hint line (matches `PersistentCirclesLayer`). */
export function getUnderCirclesHintBlockHeight(windowWidth: number): number {
  return getCirclesToHintGap(windowWidth) + getUnderCirclesHintSlotHeight(windowWidth);
}

/** One main line — used for text min-height and tight follow-up spacing. */
export function getMainCopySingleLineHeight(windowWidth: number, fontScale = getCappedFontScale()): number {
  const capped = getCappedFontScale(fontScale);
  return Math.round(scaleByWidth(24, windowWidth) * capped);
}

/** Reserved height for the primary main line — scales with Dynamic Type (up to ~2 lines). */
export function getMainCopySlotHeight(windowWidth: number, fontScale = getCappedFontScale()): number {
  const lineHeight = getMainCopySingleLineHeight(windowWidth, fontScale);
  return clamp(lineHeight * 2, 52, lineHeight * 4);
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

/** Bottom inset for the shared main-line band — matches trigger with paths footer. */
export function getFlowMainZoneBottom(
  windowWidth: number,
  fontScale: number,
  footerBottomInset: number,
): number {
  const footerRowHeight = clamp(scaleByWidth(44, windowWidth) * fontScale, 44, 132);
  return footerRowHeight + scaleByWidth(spacing.xs, windowWidth) + footerBottomInset;
}

/** Vertically center one main line in the flow band. */
export function getCenteredMainCopyTop(
  windowHeight: number,
  insets: { top: number; bottom: number },
  windowWidth: number,
  fontScale: number,
  mainZoneBottom: number,
): number {
  const metrics = getCirclesAnchorMetrics(windowHeight, insets);
  const bandTop = getTriggerMainCopyTop(metrics, windowWidth);
  const bandBottom = windowHeight - insets.top - mainZoneBottom;
  const singleLineHeight = getMainCopySingleLineHeight(windowWidth, fontScale);
  const bandHeight = Math.max(0, bandBottom - bandTop);
  return bandTop + Math.max(0, (bandHeight - singleLineHeight) / 2);
}

/** Return follow-up — below pinned main line slot. */
export function getReturnFollowUpTop(
  metrics: CirclesAnchorMetrics,
  windowWidth: number,
  fontScale = getCappedFontScale(),
): number {
  const mainTop = getTriggerMainCopyTop(metrics, windowWidth);
  const mainSlotHeight = getMainCopySlotHeight(windowWidth, fontScale);
  const gap = scaleByWidth(16, windowWidth);
  return mainTop + mainSlotHeight + gap;
}

/** Main clamp + follow-up scroll band when explanation sits below the main line. */
export function getFollowUpContentLayout(
  windowHeight: number,
  insets: { top: number; bottom: number },
  windowWidth: number,
  fontScale: number,
  footerReserve: number,
  followUpGapScale = 10,
  centerMainInFlowBand = false,
  footerBottomInset = 0,
): {
  mainTop: number;
  mainClampHeight: number;
  scrollTop: number;
  scrollBottom: number;
} {
  const metrics = getCirclesAnchorMetrics(windowHeight, insets);
  const gap = scaleByWidth(followUpGapScale, windowWidth);
  const singleLineHeight = getMainCopySingleLineHeight(windowWidth, fontScale);
  const mainTop = centerMainInFlowBand
    ? getCenteredMainCopyTop(
        windowHeight,
        insets,
        windowWidth,
        fontScale,
        getFlowMainZoneBottom(windowWidth, fontScale, footerBottomInset),
      )
    : getTriggerMainCopyTop(metrics, windowWidth);
  const mainClampHeight = singleLineHeight;

  return {
    mainTop,
    mainClampHeight,
    scrollTop: mainTop + mainClampHeight + gap,
    scrollBottom: footerReserve,
  };
}

/** Top of main copy below circles block (rings + fixed under-circles hint slot). */
export function getContentZoneTopWithoutHint(
  metrics: CirclesAnchorMetrics,
  windowWidth: number,
): number {
  const gap = scaleByWidth(circlesLayout.textGap, windowWidth);
  return metrics.circlesBottomY + getUnderCirclesHintBlockHeight(windowWidth) + gap;
}
