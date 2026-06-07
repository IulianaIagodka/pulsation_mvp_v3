import { PixelRatio, StyleSheet, type StyleProp, type TextStyle } from "react-native";
import { clampFontScale, MAX_FONT_SIZE_MULTIPLIER, MIN_FONT_SIZE_MULTIPLIER } from "./accessibility-scale";

export { MAX_FONT_SIZE_MULTIPLIER, MIN_FONT_SIZE_MULTIPLIER };

export function getCappedFontScale(raw = PixelRatio.getFontScale()): number {
  return clampFontScale(raw);
}

/** Applies capped system scale to explicit fontSize / lineHeight; use with allowFontScaling={false}. */
export function applyCappedFontScale(style: StyleProp<TextStyle>): StyleProp<TextStyle> {
  const flat = StyleSheet.flatten(style);
  if (!flat) return style;

  const scale = getCappedFontScale();
  const scaled: TextStyle = {};
  if (typeof flat.fontSize === "number") {
    scaled.fontSize = flat.fontSize * scale;
  }
  if (typeof flat.lineHeight === "number") {
    scaled.lineHeight = flat.lineHeight * scale;
  }
  if (Object.keys(scaled).length === 0) return style;
  return StyleSheet.flatten([style, scaled]);
}

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
