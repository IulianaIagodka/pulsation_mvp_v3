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
  /** Tap on circles reveals each line; auto timing when false. */
  tapReveal?: boolean;
  revealedLineCount?: number;
};

function useOnboardingLineTiming(phaseRelative: boolean, tapReveal: boolean) {
  const delayFor = (lineIndex: number) =>
    tapReveal
      ? 0
      : phaseRelative
        ? getOnboardingStepRevealDelayMs(lineIndex)
        : getOnboardingExplanationDelayMs(lineIndex);
  const stepFadeMs = phaseRelative ? onboardingCopy.stepFadeMs : undefined;
  return { delayFor, stepFadeMs };
}

function isLineVisible(lineIndex: number, tapReveal: boolean, revealedLineCount: number): boolean {
  if (screenshotMode || !tapReveal) {
    return true;
  }
  return revealedLineCount > lineIndex;
}

/** Pinned “How it works:” — does not scroll with steps. */
export function OnboardingHowItWorksSubtitle({
  phaseRelative = false,
  tapReveal = false,
  revealedLineCount = 0,
}: IntroBelowProps) {
  const { delayFor, stepFadeMs } = useOnboardingLineTiming(phaseRelative, tapReveal);

  if (!isLineVisible(0, tapReveal, revealedLineCount)) {
    return null;
  }

  return (
    <ExplanationText
      variant="onboardingDetail"
      delayMs={delayFor(0)}
      fadeMs={stepFadeMs}
      style={styles.subtitle}
      forceVisible={screenshotMode}
      holdAfterReveal
    >
      {uiCopy.onboardingSubtitle}
    </ExplanationText>
  );
}

/** Steps only — scrolls when they do not fit. */
export function OnboardingHowItWorksSteps({
  phaseRelative = false,
  tapReveal = false,
  revealedLineCount = 0,
}: IntroBelowProps) {
  const { delayFor, stepFadeMs } = useOnboardingLineTiming(phaseRelative, tapReveal);

  return (
    <View style={styles.steps}>
      {uiCopy.onboardingSteps.map((step, index) => {
        const lineIndex = index + 1;
        if (!isLineVisible(lineIndex, tapReveal, revealedLineCount)) {
          return null;
        }
        return (
          <ExplanationText
            key={step}
            variant="onboardingDetail"
            delayMs={delayFor(lineIndex)}
            fadeMs={stepFadeMs}
            style={index === 0 ? styles.stepLineFirst : styles.stepLine}
            forceVisible={screenshotMode}
            holdAfterReveal
          >
            {step}
          </ExplanationText>
        );
      })}
    </View>
  );
}

/** Subtitle and steps — tap hint under circles always comes last. */
export function OnboardingIntroBelow({
  phaseRelative = false,
  tapReveal = false,
  revealedLineCount = 0,
}: IntroBelowProps) {
  return (
    <View style={styles.below}>
      <OnboardingHowItWorksSubtitle
        phaseRelative={phaseRelative}
        tapReveal={tapReveal}
        revealedLineCount={revealedLineCount}
      />
      <OnboardingHowItWorksSteps
        phaseRelative={phaseRelative}
        tapReveal={tapReveal}
        revealedLineCount={revealedLineCount}
      />
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
    marginTop: spacing.sm,
  },
  stepLineFirst: {
    marginTop: spacing.sm,
  },
});
