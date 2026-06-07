import { Platform, type TextStyle } from "react-native";
import { colors } from "./tokens";

/** Primary calm line — matches onboarding “Pulsation exists”. */
export const mainCopyTextStyle: TextStyle = {
  color: colors.textSecondary,
  fontSize: 17,
  lineHeight: 24,
  fontWeight: "400",
  textAlign: "center",
  letterSpacing: 0.15,
  width: "100%",
  maxWidth: "100%",
  alignSelf: "stretch",
  flexShrink: 1,
  fontFamily: Platform.select({ ios: "Times New Roman", default: "serif" }),
};

/** Footer links — Save / Return / Paths / About. */
export const footerLinkTextStyle: TextStyle = {
  color: colors.textSecondary,
  fontSize: 11,
  lineHeight: 15,
  fontWeight: "400",
  textAlign: "center",
  letterSpacing: 0.16,
};

/** Quieter copy — explanations, onboarding steps, return follow-up. */
export const explanationTextStyle: TextStyle = {
  color: colors.textSecondary,
  fontSize: 12,
  lineHeight: 16,
  fontWeight: "400",
  textAlign: "center",
  letterSpacing: 0.15,
  alignSelf: "stretch",
  width: "100%",
  maxWidth: "100%",
  flexShrink: 1,
};

/** Tap hint under circles — same size and tone as footer links. */
export const tapHintTextStyle: TextStyle = {
  ...footerLinkTextStyle,
  width: "100%",
  maxWidth: "100%",
  flexShrink: 1,
};
