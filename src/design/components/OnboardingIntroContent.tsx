import { StyleSheet, View } from "react-native";
import { ExplanationText } from "./ExplanationText";
import { InlineSpiralHintSlot } from "./InlineSpiralHintSlot";
import { getOnboardingExplanationDelayMs, getOnboardingSpiralHintDelayMs } from "../animation-rhythm";
import { spacing } from "../tokens";
import { uiCopy } from "../../modules/delivery-layer";
import { isAppStoreScreenshotMode } from "../../modules/app-store-screenshot-mode";
import { useSpiralHintPresentation } from "../../hooks/use-spiral-hint-presentation";

const screenshotMode = isAppStoreScreenshotMode();

/** Main onboarding line — same Y as trigger “One action for you”. */
export function OnboardingHeadline() {
  return (
    <ExplanationText variant="main" holdAfterReveal forceVisible={screenshotMode}>
      {uiCopy.onboardingLine}
    </ExplanationText>
  );
}

/** Subtitle, steps, and spiral hint below the main line. */
export function OnboardingIntroBelow() {
  const hintDelayMs = getOnboardingSpiralHintDelayMs(uiCopy.onboardingSteps.length);
  const spiralHintLive = useSpiralHintPresentation(hintDelayMs);
  const spiralHint = screenshotMode
    ? { shouldShow: true, delayMs: hintDelayMs, textOpacity: spiralHintLive.textOpacity }
    : spiralHintLive;

  return (
    <View style={styles.below}>
      <ExplanationText
        variant="explanation"
        delayMs={getOnboardingExplanationDelayMs(0)}
        style={styles.bodyLineFirst}
        forceVisible={screenshotMode}
      >
        {uiCopy.onboardingSubtitle}
      </ExplanationText>

      {uiCopy.onboardingSteps.map((step, index) => (
        <ExplanationText
          key={step}
          variant="explanation"
          delayMs={getOnboardingExplanationDelayMs(index + 1)}
          style={styles.bodyLine}
          forceVisible={screenshotMode}
        >
          {step}
        </ExplanationText>
      ))}

      <InlineSpiralHintSlot
        presentation={spiralHint}
        delayMs={hintDelayMs}
        label={uiCopy.onboardingSpiralHint}
        forceVisible={screenshotMode}
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
  },
  bodyLine: {
    marginTop: screenshotMode ? spacing.sm : spacing.md,
  },
  bodyLineFirst: {
    marginTop: screenshotMode ? spacing.xs : spacing.md,
  },
});
