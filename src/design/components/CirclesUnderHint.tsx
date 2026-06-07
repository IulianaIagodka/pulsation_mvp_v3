import { StyleProp, StyleSheet, View, ViewStyle, useWindowDimensions, type EasingFunction } from "react-native";
import { uiCopy } from "../../modules/delivery-layer";
import type { CirclesHintPresentation } from "../../modules/circles-hint-presentation";
import { getCirclesToHintGap, getUnderCirclesHintSlotHeight } from "../circles-anchor-layout";
import { ExplanationText } from "./ExplanationText";

type Props = {
  presentation: CirclesHintPresentation;
  visible?: boolean;
  /** Overrides `presentation.delayMs` (e.g. onboarding: always last line). */
  delayMs?: number;
  fadeMs?: number;
  fadeEasing?: EasingFunction;
  /** Onboarding: `uiCopy.onboardingCirclesHint`. Flow: `uiCopy.tapContinueHint` (“tap to continue”). */
  label?: string;
  style?: StyleProp<ViewStyle>;
  holdAfterReveal?: boolean;
  revealId?: string;
  forceVisible?: boolean;
  /** Keep a fixed slot so layout never shifts when hint is hidden. */
  reserveSlot?: boolean;
};

/** Tap hint fixed under circles — slot stays; opacity hides when inactive. */
export function CirclesUnderHint({
  presentation,
  visible = true,
  delayMs,
  fadeMs,
  fadeEasing,
  label,
  style,
  holdAfterReveal = false,
  revealId,
  forceVisible = false,
  reserveSlot = true,
}: Props) {
  const { width } = useWindowDimensions();
  const hintGap = getCirclesToHintGap(width);
  const slotHeight = getUnderCirclesHintSlotHeight(width);
  const active = visible && presentation.shouldShow;

  if (!reserveSlot && !active) {
    return null;
  }

  return (
    <View
      style={[
        styles.slot,
        { marginTop: hintGap },
        reserveSlot ? { minHeight: slotHeight } : null,
        style,
      ]}
    >
      <View
        style={[styles.inner, !active && styles.inactive]}
        pointerEvents={active ? "auto" : "none"}
      >
        {active ? (
          <ExplanationText
            variant="hint"
            delayMs={delayMs ?? presentation.delayMs}
            fadeMs={fadeMs}
            fadeEasing={fadeEasing}
            textOpacity={presentation.textOpacity}
            holdAfterReveal={holdAfterReveal}
            revealId={revealId}
            forceVisible={forceVisible}
          >
            {label ?? uiCopy.tapContinueHint}
          </ExplanationText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  inner: {
    width: "100%",
    alignItems: "center",
  },
  inactive: {
    opacity: 0,
  },
});
