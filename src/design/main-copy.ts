import { type TextStyle } from "react-native";
import { legibleOpacity } from "./accessibility";
import { appFontFamily } from "./app-font";
import { colors, footerFaintLinkOpacity } from "./tokens";

const sharedFont: Pick<TextStyle, "fontFamily" | "fontWeight"> = {
  fontFamily: appFontFamily,
  fontWeight: "400",
};

/** Section heading — “How it works:”, About title, paths count. */
export const sectionHeadingTextStyle: TextStyle = {
  ...sharedFont,
  color: colors.textSecondary,
  fontSize: 20,
  lineHeight: 24,
  textAlign: "center",
  letterSpacing: 0.15,
  width: "100%",
  maxWidth: "100%",
  alignSelf: "stretch",
  flexShrink: 1,
};

/** Primary calm line — matches onboarding “Pulsation exists”. */
export const mainCopyTextStyle: TextStyle = {
  ...sharedFont,
  color: colors.textSecondary,
  fontSize: 17,
  lineHeight: 24,
  textAlign: "center",
  letterSpacing: 0.15,
  width: "100%",
  maxWidth: "100%",
  alignSelf: "stretch",
  flexShrink: 1,
};

/** Footer links — Save / Return / Paths / About / tap hint. */
export const footerLinkTextStyle: TextStyle = {
  ...sharedFont,
  color: colors.textSecondary,
  fontSize: 11,
  lineHeight: 15,
  textAlign: "center",
  letterSpacing: 0.16,
};

/** Shared faint tone for footer links and under-circles tap hint. */
export { footerFaintLinkOpacity } from "./tokens";

export function getFooterFaintLinkStyle(highContrast: boolean): TextStyle {
  return {
    ...footerLinkTextStyle,
    ...(highContrast ? { color: colors.textPrimary } : null),
    opacity: legibleOpacity(footerFaintLinkOpacity, highContrast, "faint"),
  };
}

/** Return follow-up and find-3 bullets — same size as main, slightly dimmer. */
export const explanationTextStyle: TextStyle = {
  ...sharedFont,
  color: colors.textSecondary,
  fontSize: 17,
  lineHeight: 24,
  textAlign: "center",
  letterSpacing: 0.15,
  alignSelf: "stretch",
  width: "100%",
  maxWidth: "100%",
  flexShrink: 1,
};

/** @deprecated Use {@link footerLinkTextStyle} + {@link getFooterFaintLinkStyle}. */
export const tapHintTextStyle: TextStyle = footerLinkTextStyle;
