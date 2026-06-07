import { StyleSheet, View } from "react-native";
import { ExplanationText } from "./ExplanationText";
import {
  getOnboardingExplanationDelayMs,
  getOnboardingStepRevealDelayMs,
  onboardingCopy,
} from "../animation-rhythm";
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

type IntroBelowProps = {
  /** Delays from “How it works” phase mount (extended onboarding). */
  phaseRelative?: boolean;
};

function useOnboardingLineTiming(phaseRelative: boolean) {
  const delayFor = (lineIndex: number) =>
    phaseRelative ? getOnboardingStepRevealDelayMs(lineIndex) : getOnboardingExplanationDelayMs(lineIndex);
  const stepFadeMs = phaseRelative ? onboardingCopy.stepFadeMs : undefined;
  return { delayFor, stepFadeMs };
}

/** Pinned “How it works:” — does not scroll with steps. */
export function OnboardingHowItWorksSubtitle({ phaseRelative = false }: IntroBelowProps) {
  const { delayFor, stepFadeMs } = useOnboardingLineTiming(phaseRelative);

  return (
    <ExplanationText
      variant="main"
      delayMs={delayFor(0)}
      fadeMs={stepFadeMs}
      style={styles.subtitle}
      forceVisible={screenshotMode}
    >
      {uiCopy.onboardingSubtitle}
    </ExplanationText>
  );
}

/** Steps only — scrolls when they do not fit. */
export function OnboardingHowItWorksSteps({ phaseRelative = false }: IntroBelowProps) {
  const { delayFor, stepFadeMs } = useOnboardingLineTiming(phaseRelative);

  return (
    <View style={styles.steps}>
      {uiCopy.onboardingSteps.map((step, index) => (
        <ExplanationText
          key={step}
          variant="main"
          delayMs={delayFor(index + 1)}
          fadeMs={stepFadeMs}
          style={index === 0 ? styles.stepLineFirst : styles.stepLine}
          forceVisible={screenshotMode}
        >
          {step}
        </ExplanationText>
      ))}
    </View>
  );
}

/** Subtitle and steps — tap hint under circles always comes last. */
export function OnboardingIntroBelow({ phaseRelative = false }: IntroBelowProps) {
  return (
    <View style={styles.below}>
      <OnboardingHowItWorksSubtitle phaseRelative={phaseRelative} />
      <OnboardingHowItWorksSteps phaseRelative={phaseRelative} />
    </View>
  );
}

const styles = StyleSheet.create({
  below: {
    alignItems: "stretch",
    justifyContent: "center",
    width: "100%",
    alignSelf: "stretch",
    minWidth: 0,
  },
  subtitle: {
    marginTop: screenshotMode ? spacing.xs : 0,
  },
  steps: {
    width: "100%",
    alignSelf: "stretch",
    minWidth: 0,
  },
  stepLine: {
    marginTop: screenshotMode ? spacing.sm : spacing.md,
  },
  stepLineFirst: {
    marginTop: screenshotMode ? spacing.sm : spacing.md,
  },
});
