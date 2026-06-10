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

/** Bottom overflow from layout box to visual edge of the largest ring at max inhale. */
export function getLargestCircleBottomOverflow(windowWidth: number): number {
  const { size, outerBorderWidth, shadowOffsetY, shadowRadius } = circlesLayout;
  const { scaleInhale } = breathingRhythm.circles;
  const radius = size / 2;
  const inhaleOverflow = radius * (scaleInhale - 1);
  const borderOverflow = outerBorderWidth / 2;
  const shadowOverflow = shadowOffsetY + shadowRadius;
  const buffer = scaleByWidth(spacing.xs, windowWidth);
  return inhaleOverflow + borderOverflow + shadowOverflow + buffer;
}

/** Visible breathing room between largest circle edge and main copy. */
export function getMainCopyBelowCirclesGap(windowWidth: number): number {
  return scaleByWidth(circlesLayout.textGap + spacing.xl + spacing.md + spacing.sm, windowWidth);
}

/** Gap between circles block and hint slot — clears max inhale diameter + shadow. */
export function getCirclesToHintGap(windowWidth: number): number {
  return getLargestCircleBottomOverflow(windowWidth) + scaleByWidth(4, windowWidth);
}

/** Fixed text line under circles — scales with Dynamic Type (up to ~2 lines). */
export function getUnderCirclesHintSlotHeight(windowWidth: number, fontScale = getCappedFontScale()): number {
  const capped = getCappedFontScale(fontScale);
  const lineHeight = clamp(Math.round(scaleByWidth(16, windowWidth) * capped), 16, 44);
  return lineHeight * 2;
}

/** Full reserved block: gap + hint line (matches `PersistentCirclesLayer`). */
export function getUnderCirclesHintBlockHeight(windowWidth: number, fontScale = getCappedFontScale()): number {
  return getCirclesToHintGap(windowWidth) + getUnderCirclesHintSlotHeight(windowWidth, fontScale);
}

/** Block above circles when onboarding tap hint uses `placement: "above"`. */
export function getCirclesHintAboveBlockHeight(
  windowWidth: number,
  fontScale = getCappedFontScale(),
): number {
  return getUnderCirclesHintSlotHeight(windowWidth, fontScale) + getCirclesToHintGap(windowWidth);
}

/** One main line — used for text min-height and tight follow-up spacing. */
export function getMainCopySingleLineHeight(windowWidth: number, fontScale = getCappedFontScale()): number {
  const capped = getCappedFontScale(fontScale);
  return Math.round(scaleByWidth(28, windowWidth) * capped);
}

/** Reserved height for the primary main line — scales with Dynamic Type (multi-line wrap). */
export function getMainCopySlotHeight(windowWidth: number, fontScale = getCappedFontScale()): number {
  const lineHeight = getMainCopySingleLineHeight(windowWidth, fontScale);
  const capped = getCappedFontScale(fontScale);
  const lineBudget = capped > 1.5 ? 6 : 4;
  return clamp(lineHeight * 2, 52, lineHeight * lineBudget);
}

/** Vertical center of the full display, in scroll coordinates (below top safe area). */
export function getScreenEquatorY(
  windowHeight: number,
  insets: { top: number; bottom: number },
): number {
  return windowHeight / 2 - insets.top;
}

/** Visual bottom of largest circle (max inhale + shadow) in scroll coordinates below top safe area. */
export function getVisualCirclesBottomY(
  metrics: CirclesAnchorMetrics,
  windowWidth: number,
  hintAboveBlockHeight = 0,
): number {
  return (
    metrics.circlesBottomY -
    hintAboveBlockHeight +
    getLargestCircleBottomOverflow(windowWidth)
  );
}

export type CirclesHintPlacement = "above" | "below" | "none";

/** Top of main copy — always below visual circles; never overlaps rings or tap hint. */
export function getMainCopyZoneTop(
  metrics: CirclesAnchorMetrics,
  windowWidth: number,
  fontScale = getCappedFontScale(),
  hintPlacement: CirclesHintPlacement = "none",
): number {
  const copyGap = getMainCopyBelowCirclesGap(windowWidth);
  const hintAboveBlockHeight =
    hintPlacement === "above" ? getCirclesHintAboveBlockHeight(windowWidth, fontScale) : 0;
  const visualCirclesBottom = getVisualCirclesBottomY(metrics, windowWidth, hintAboveBlockHeight);

  if (hintPlacement === "below") {
    return visualCirclesBottom + getUnderCirclesHintBlockHeight(windowWidth, fontScale) + copyGap;
  }

  return visualCirclesBottom + copyGap;
}

/** Main line Y on every flow screen — matches extended onboarding (“Pulsation exists…”). */
export function getFlowMainCopyTop(
  metrics: CirclesAnchorMetrics,
  windowWidth: number,
  fontScale = getCappedFontScale(),
): number {
  return getMainCopyZoneTop(metrics, windowWidth, fontScale, "above");
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
  const bandTop = getMainCopyZoneTop(metrics, windowWidth, fontScale, "none");
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
  const mainTop = getFlowMainCopyTop(metrics, windowWidth, fontScale);
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
  const mainSlotHeight = getMainCopySlotHeight(windowWidth, fontScale);
  const mainTop = centerMainInFlowBand
    ? getCenteredMainCopyTop(
        windowHeight,
        insets,
        windowWidth,
        fontScale,
        getFlowMainZoneBottom(windowWidth, fontScale, footerBottomInset),
      )
    : getFlowMainCopyTop(metrics, windowWidth, fontScale);
  const mainClampHeight = mainSlotHeight;

  return {
    mainTop,
    mainClampHeight,
    scrollTop: mainTop + mainClampHeight + gap,
    scrollBottom: footerReserve,
  };
}
