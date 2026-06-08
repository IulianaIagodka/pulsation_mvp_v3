import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, StyleSheet } from "react-native";
import { AnchoredCirclesScreen } from "./AnchoredCirclesScreen";
import { AboutFooterLink } from "./AboutFooterLink";
import { OnboardingHeadline, OnboardingIntroBelow } from "./OnboardingIntroContent";
import { OnboardingPhasedContent } from "./OnboardingPhasedContent";
import {
  breathingRhythm,
  copyReveal,
  getOnboardingCirclesHintDelayMs,
  getOnboardingStepRevealDelayMs,
} from "../animation-rhythm";
import { armFlowScreenEntryDelay } from "../flow-screen-transition";
import { flowRevealIds } from "../flow-reveal-ids";
import { uiCopy } from "../../modules/delivery-layer";
import { useRegisterCirclesHint } from "../../hooks/use-register-circles-hint";
import { useRegisterCirclesPress } from "../../hooks/use-register-circles-press";
import { useCirclesHintPresentation } from "../../hooks/use-circles-hint-presentation";
import { markExtendedOnboardingCompleted } from "../../services/onboarding-gate";
import { isAppStoreScreenshotMode } from "../../modules/app-store-screenshot-mode";

const EXIT_FADE_MS = breathingRhythm.motion.screenFadeMs;
const ONBOARDING_HINT_DELAY_MS = getOnboardingCirclesHintDelayMs(0);

export function ExtendedOnboardingFlow() {
  const router = useRouter();
  const captureMode = isAppStoreScreenshotMode();
  const lineCount = 1 + uiCopy.onboardingSteps.length;
  const [headlinePhaseComplete, setHeadlinePhaseComplete] = useState(captureMode);
  const [headlineSkipRequest, setHeadlineSkipRequest] = useState(0);
  const [revealedLineCount, setRevealedLineCount] = useState(captureMode ? lineCount : 0);
  const [hintUnlocked, setHintUnlocked] = useState(captureMode);
  const [isExiting, setIsExiting] = useState(false);
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const allLinesRevealed = revealedLineCount >= lineCount;

  useEffect(() => {
    if (captureMode || !headlinePhaseComplete) {
      return;
    }

    const timers = Array.from({ length: lineCount }, (_, lineIndex) =>
      setTimeout(() => {
        setRevealedLineCount((count) => Math.max(count, lineIndex + 1));
      }, getOnboardingStepRevealDelayMs(lineIndex)),
    );

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [captureMode, headlinePhaseComplete, lineCount]);

  useEffect(() => {
    if (captureMode) {
      setHintUnlocked(true);
      return;
    }
    const timer = setTimeout(() => setHintUnlocked(true), ONBOARDING_HINT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [captureMode]);

  const circlesHintPresentation = useCirclesHintPresentation(copyReveal.lineGapMs);
  const hintRegistration = useMemo(
    () => ({
      presentation: circlesHintPresentation,
      visible: captureMode || hintUnlocked,
      delayMs: 0,
      fadeMs: copyReveal.fadeMs,
      label: uiCopy.onboardingCirclesHint,
      revealId: flowRevealIds.flowCirclesHint,
      forceVisible: captureMode,
      holdAfterReveal: true,
    }),
    [captureMode, circlesHintPresentation, hintUnlocked],
  );
  useRegisterCirclesHint(hintRegistration);

  const navigateToTrigger = useCallback(() => {
    if (isExiting) return;
    setIsExiting(true);
    armFlowScreenEntryDelay(EXIT_FADE_MS);
    Animated.timing(contentOpacity, {
      toValue: 0,
      duration: EXIT_FADE_MS,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) return;
      markExtendedOnboardingCompleted();
      router.replace("/trigger");
    });
  }, [contentOpacity, isExiting, router]);

  const onCirclesPress = useCallback(() => {
    if (isExiting) return;
    if (captureMode) {
      navigateToTrigger();
      return;
    }
    if (!headlinePhaseComplete) {
      setHeadlineSkipRequest((request) => request + 1);
      return;
    }
    if (!allLinesRevealed) {
      setRevealedLineCount((count) => Math.min(count + 1, lineCount));
      return;
    }
    if (!hintUnlocked) {
      return;
    }
    navigateToTrigger();
  }, [
    allLinesRevealed,
    captureMode,
    headlinePhaseComplete,
    hintUnlocked,
    isExiting,
    lineCount,
    navigateToTrigger,
  ]);
  useRegisterCirclesPress(onCirclesPress);

  const onHeadlinePhaseComplete = useCallback((options?: { skipped?: boolean }) => {
    setHeadlinePhaseComplete(true);
    if (options?.skipped) {
      setRevealedLineCount((count) => Math.max(count, 1));
    }
  }, []);

  return (
    <Animated.View style={[styles.root, { opacity: contentOpacity }]}>
      <AnchoredCirclesScreen
        footer={<AboutFooterLink label={uiCopy.aboutLink} onPress={() => router.push("/about")} />}
        centerContent={!captureMode}
        pinMainLikeTrigger={!captureMode}
        expandMainToFooter={!captureMode}
        compactCapture={captureMode}
        mainLine={
          captureMode ? undefined : (
            <OnboardingPhasedContent
              revealedLineCount={revealedLineCount}
              headlineSkipRequest={headlineSkipRequest}
              onHeadlinePhaseComplete={onHeadlinePhaseComplete}
            />
          )
        }
      >
        {captureMode ? (
          <>
            <OnboardingHeadline />
            <OnboardingIntroBelow />
          </>
        ) : null}
      </AnchoredCirclesScreen>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
