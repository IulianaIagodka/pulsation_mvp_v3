import { StyleSheet, View } from "react-native";
import { ExplanationText } from "./ExplanationText";
import { getOnboardingExplanationDelayMs } from "../animation-rhythm";
import { spacing } from "../tokens";
import { uiCopy } from "../../modules/delivery-layer";
import { isAppStoreScreenshotMode } from "../../modules/app-store-screenshot-mode";

const screenshotMode = isAppStoreScreenshotMode();

/** Main onboarding line — same Y as trigger “One action for you”. */
export function OnboardingHeadline() {
  return (
    <ExplanationText variant="main" holdAfterReveal forceVisible={screenshotMode}>
      {uiCopy.onboardingLine}
    </ExplanationText>
  );
}

/** Subtitle and steps below the main line (tap hint lives under circles). */
export function OnboardingIntroBelow() {
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
