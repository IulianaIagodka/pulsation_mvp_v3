import { StyleSheet, View } from "react-native";
import { ExplanationText } from "./ExplanationText";
import { SpiralUnderHint } from "./SpiralUnderHint";
import { getOnboardingExplanationDelayMs, getOnboardingSpiralHintDelayMs } from "../animation-rhythm";
import { spacing } from "../tokens";
import { uiCopy } from "../../modules/delivery-layer";
import { useSpiralHintPresentation } from "../../hooks/use-spiral-hint-presentation";

/** Main onboarding line — pinned to screen equator like trigger. */
export function OnboardingHeadline() {
  return (
    <ExplanationText variant="main" holdAfterReveal>{uiCopy.onboardingLine}</ExplanationText>
  );
}

/** Subtitle, steps, and spiral hint below the equator. */
export function OnboardingIntroBelow() {
  const hintDelayMs = getOnboardingSpiralHintDelayMs(uiCopy.onboardingSteps.length);
  const spiralHint = useSpiralHintPresentation(hintDelayMs);

  return (
    <View style={styles.below}>
      <ExplanationText
        variant="explanation"
        delayMs={getOnboardingExplanationDelayMs(0)}
        style={styles.bodyLine}
      >
        {uiCopy.onboardingSubtitle}
      </ExplanationText>

      {uiCopy.onboardingSteps.map((step, index) => (
        <ExplanationText
          key={step}
          variant="explanation"
          delayMs={getOnboardingExplanationDelayMs(index + 1)}
          style={styles.bodyLine}
        >
          {step}
        </ExplanationText>
      ))}

      <SpiralUnderHint
        presentation={spiralHint}
        delayMs={hintDelayMs}
        label={uiCopy.onboardingSpiralHint}
        placement="inline"
        style={styles.bodyLine}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  below: {
    alignItems: "center",
    width: "100%",
    alignSelf: "stretch",
    paddingHorizontal: spacing.md,
  },
  bodyLine: {
    marginTop: spacing.md,
  },
});
