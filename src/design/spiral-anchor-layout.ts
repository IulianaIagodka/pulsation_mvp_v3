import { PixelRatio } from "react-native";
import { breathingRhythm, spiralLayout } from "./animation-rhythm";
import { MAX_FONT_SIZE_MULTIPLIER } from "./accessibility";
import { clamp, scaleByWidth } from "./responsive";

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

export function getSpiralHintLineHeight(windowWidth: number, fontScale = PixelRatio.getFontScale()): number {
  const capped = Math.min(fontScale, MAX_FONT_SIZE_MULTIPLIER);
  return clamp(Math.round(scaleByWidth(16, windowWidth) * capped), 14, 56);
}

/** Top of under-spiral hint in scroll coordinates. */
export function getSpiralHintTopY(metrics: SpiralAnchorMetrics, windowWidth: number): number {
  const gap = scaleByWidth(spiralLayout.hintBelowSpiralGap, windowWidth);
  return metrics.spiralBottomY + getSpiralBreathBottomOverflow(windowWidth) + gap;
}

/** Vertical center of the full display, in scroll coordinates (below top safe area). */
export function getScreenEquatorY(
  windowHeight: number,
  insets: { top: number; bottom: number },
): number {
  return windowHeight / 2 - insets.top;
}

/** Top of scroll copy when the under-spiral hint is not shown yet. */
export function getContentZoneTopWithoutHint(
  metrics: SpiralAnchorMetrics,
  windowWidth: number,
): number {
  const gap = scaleByWidth(spiralLayout.textGap, windowWidth);
  return metrics.spiralBottomY + getSpiralBreathBottomOverflow(windowWidth) + gap;
}

/** Top of scroll copy on action — extra space below the under-spiral hint. */
export function getContentZoneTopWithHint(
  metrics: SpiralAnchorMetrics,
  windowWidth: number,
  fontScale = PixelRatio.getFontScale(),
): number {
  const hintTop = getSpiralHintTopY(metrics, windowWidth);
  const lineHeight = getSpiralHintLineHeight(windowWidth, fontScale);
  const hintToContent = scaleByWidth(spiralLayout.hintToContentGap, windowWidth);
  return hintTop + lineHeight + hintToContent;
}

