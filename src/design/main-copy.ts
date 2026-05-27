import { Platform, type TextStyle } from "react-native";
import { colors } from "./tokens";

/** Primary calm line — matches onboarding “Pulsation exists”. */
export const mainCopyTextStyle: TextStyle = {
  color: colors.textSecondary,
  fontSize: 17,
  lineHeight: 22,
  fontWeight: "400",
  textAlign: "center",
  letterSpacing: 0.15,
  width: "100%",
  maxWidth: "100%",
  flexShrink: 1,
  fontFamily: Platform.select({ ios: "Times New Roman", default: "serif" }),
};
