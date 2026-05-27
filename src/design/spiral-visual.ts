import { StyleSheet } from "react-native";
import { colors } from "./tokens";
import { spiralLayout } from "./animation-rhythm";

/** Shared concentric-ring spiral — matches SpiralFocus on every screen. */
export const spiralVisualStyles = StyleSheet.create({
  outer: {
    width: spiralLayout.size,
    height: spiralLayout.size,
    borderRadius: spiralLayout.size / 2,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.spiralRing,
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
    borderColor: colors.spiralRing,
    opacity: 0.55,
  },
  ringL: {
    position: "absolute",
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 1,
    borderColor: colors.spiralRing,
    opacity: 0.58,
  },
  ringM: {
    position: "absolute",
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 1,
    borderColor: colors.spiralRing,
    opacity: 0.62,
  },
  ringS: {
    position: "absolute",
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.spiralRing,
    opacity: 0.65,
  },
  centerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.spiralInner,
    opacity: 0.8,
  },
});
