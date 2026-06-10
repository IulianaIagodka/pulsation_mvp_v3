import { StyleSheet } from "react-native";
import { colors } from "./tokens";
import { circlesLayout } from "./animation-rhythm";

/** Shared concentric rings — same circles visual on every screen. */
export const circlesVisualStyles = StyleSheet.create({
  outer: {
    width: circlesLayout.size,
    height: circlesLayout.size,
    borderRadius: circlesLayout.size / 2,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.15,
    borderColor: colors.circlesRing,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  ringXL: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 1,
    borderColor: colors.circlesRing,
    opacity: 0.68,
  },
  ringXLHighContrast: {
    opacity: 0.55,
    borderWidth: 1.2,
  },
  ringL: {
    position: "absolute",
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 1,
    borderColor: colors.circlesRing,
    opacity: 0.72,
  },
  ringLHighContrast: {
    opacity: 0.58,
    borderWidth: 1.2,
  },
  ringM: {
    position: "absolute",
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 1,
    borderColor: colors.circlesRing,
    opacity: 0.76,
  },
  ringMHighContrast: {
    opacity: 0.62,
    borderWidth: 1.2,
  },
  ringS: {
    position: "absolute",
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.circlesRing,
    opacity: 0.8,
  },
  ringSHighContrast: {
    opacity: 0.65,
    borderWidth: 1.2,
  },
  centerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.circlesInner,
    opacity: 0.92,
  },
  centerDotHighContrast: {
    opacity: 0.86,
  },
  outerHighlighted: {
    borderColor: colors.circlesRingHighlight,
    shadowOpacity: 0.22,
    shadowRadius: 18,
  },
  ringXLHighlighted: {
    borderColor: colors.circlesRingHighlight,
    opacity: 0.82,
  },
  ringLHighlighted: {
    borderColor: colors.circlesRingHighlight,
    opacity: 0.86,
  },
  ringMHighlighted: {
    borderColor: colors.circlesRingHighlight,
    opacity: 0.9,
  },
  ringSHighlighted: {
    borderColor: colors.circlesRingHighlight,
    opacity: 0.94,
  },
  centerDotHighlighted: {
    opacity: 1,
  },
});
