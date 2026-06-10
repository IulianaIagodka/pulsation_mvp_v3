import { type TextStyle } from "react-native";
import { legibleOpacity } from "./accessibility";
import { appFontFamily, utilityFontFamily } from "./app-font";
import { colors, footerFaintLinkOpacity, mainCopyOpacity } from "./tokens";

const sharedFont: Pick<TextStyle, "fontFamily" | "fontWeight"> = {
  fontFamily: appFontFamily,
  fontWeight: "400",
};

/** Section heading — “How it works:”, About title, paths count. */
export const sectionHeadingTextStyle: TextStyle = {
  ...sharedFont,
  color: colors.textSecondaryDeep,
  fontSize: 20,
  lineHeight: 24,
  textAlign: "center",
  letterSpacing: 0.15,
  width: "100%",
  maxWidth: "100%",
  alignSelf: "stretch",
  flexShrink: 1,
  opacity: mainCopyOpacity,
};

/** Primary calm line — trigger, action, return, onboarding headline. */
export const mainCopyTextStyle: TextStyle = {
  ...sharedFont,
  color: colors.textSecondaryDeep,
  fontSize: 20,
  lineHeight: 28,
  textAlign: "center",
  letterSpacing: 0.15,
  width: "100%",
  maxWidth: "100%",
  alignSelf: "stretch",
  flexShrink: 1,
  opacity: mainCopyOpacity,
};

/** Extended onboarding headline — same tone as main copy; tighter wrap when two lines. */
export const onboardingHeadlineTextStyle: TextStyle = {
  ...mainCopyTextStyle,
  lineHeight: 24,
};

/** How it works + steps — quieter and smaller than headline. */
export const onboardingDetailTextStyle: TextStyle = {
  ...sharedFont,
  color: colors.textSecondaryMuted,
  fontSize: 17,
  lineHeight: 22,
  textAlign: "center",
  letterSpacing: 0.15,
  width: "100%",
  maxWidth: "100%",
  alignSelf: "stretch",
  flexShrink: 1,
  opacity: 1,
};

const utilityFont: Pick<TextStyle, "fontFamily" | "fontWeight"> = {
  fontFamily: utilityFontFamily,
  fontWeight: "400",
};

/** Footer links — Save / Return / Paths / About / onboarding tap hint. */
export const footerLinkTextStyle: TextStyle = {
  ...utilityFont,
  color: colors.textSecondary,
  fontSize: 12,
  lineHeight: 16,
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

/** Return follow-up and find-3 bullets — quieter than main. */
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

