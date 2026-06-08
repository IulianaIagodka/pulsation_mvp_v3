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
import { uiCopy } from "../../modules/delivery-layer";
import { useRegisterCirclesHint } from "../../hooks/use-register-circles-hint";
import { useRegisterCirclesPress } from "../../hooks/use-register-circles-press";
import { useCirclesHintPresentation } from "../../hooks/use-circles-hint-presentation";
import { markExtendedOnboardingCompleted } from "../../services/onboarding-gate";
import { isAppStoreScreenshotMode } from "../../modules/app-store-screenshot-mode";

const EXIT_FADE_MS = breathingRhythm.motion.screenFadeMs;
const ONBOARDING_HINT_DELAY_MS = getOnboardingCirclesHintDelayMs(0);
const ONBOARDING_HINT_READY_MS = ONBOARDING_HINT_DELAY_MS + copyReveal.fadeMs;

export function ExtendedOnboardingFlow() {
  const router = useRouter();
  const captureMode = isAppStoreScreenshotMode();
  const lineCount = 1 + uiCopy.onboardingSteps.length;
  const [headlinePhaseComplete, setHeadlinePhaseComplete] = useState(captureMode);
  const [headlineSkipRequest, setHeadlineSkipRequest] = useState(0);
  const [revealedLineCount, setRevealedLineCount] = useState(captureMode ? lineCount : 0);
  const [hintUnlocked, setHintUnlocked] = useState(captureMode);
  const [hintFadingOut, setHintFadingOut] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const stepRevealTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const allLinesRevealed = revealedLineCount >= lineCount;

  const cancelStepRevealTimers = useCallback(() => {
    stepRevealTimersRef.current.forEach(clearTimeout);
    stepRevealTimersRef.current = [];
  }, []);

  useEffect(() => {
    if (captureMode || !headlinePhaseComplete) {
      return;
    }

    cancelStepRevealTimers();
    const timers = Array.from({ length: lineCount }, (_, lineIndex) =>
      setTimeout(() => {
        setRevealedLineCount((count) => Math.max(count, lineIndex + 1));
      }, getOnboardingStepRevealDelayMs(lineIndex)),
    );
    stepRevealTimersRef.current = timers;

    return cancelStepRevealTimers;
  }, [cancelStepRevealTimers, captureMode, headlinePhaseComplete, lineCount]);

  useEffect(() => {
    if (captureMode) {
      setHintUnlocked(true);
      return;
    }
    const timer = setTimeout(() => setHintUnlocked(true), ONBOARDING_HINT_READY_MS);
    return () => clearTimeout(timer);
  }, [captureMode]);

  const circlesHintPresentation = useCirclesHintPresentation(ONBOARDING_HINT_DELAY_MS);
  const hintRegistration = useMemo(
    () => ({
      presentation: { ...circlesHintPresentation, shouldShow: true },
      visible: true,
      delayMs: ONBOARDING_HINT_DELAY_MS,
      fadeMs: copyReveal.fadeMs,
      label: uiCopy.onboardingCirclesHint,
      forceVisible: captureMode,
      holdAfterReveal: true,
      fadeOutDelayMs: hintFadingOut && !captureMode ? 0 : undefined,
    }),
    [captureMode, circlesHintPresentation, hintFadingOut],
  );
  useRegisterCirclesHint(hintRegistration);

  const navigateToTrigger = useCallback(() => {
    if (isExiting) return;
    setIsExiting(true);
    const waitMs = hintFadingOut ? 0 : copyReveal.fadeMs;
    if (!hintFadingOut) {
      setHintFadingOut(true);
    }
    armFlowScreenEntryDelay(EXIT_FADE_MS);
    Animated.timing(contentOpacity, {
      toValue: 0,
      duration: EXIT_FADE_MS,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
    setTimeout(() => {
      markExtendedOnboardingCompleted();
      router.replace("/trigger");
    }, waitMs);
  }, [contentOpacity, hintFadingOut, isExiting, router]);

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
      cancelStepRevealTimers();
      setRevealedLineCount(lineCount);
      setHintFadingOut(true);
      return;
    }
    if (!hintUnlocked) {
      return;
    }
    navigateToTrigger();
  }, [
    allLinesRevealed,
    cancelStepRevealTimers,
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
