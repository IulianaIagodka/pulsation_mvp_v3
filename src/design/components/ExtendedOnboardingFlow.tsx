import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet } from "react-native";
import { AnchoredCirclesScreen } from "./AnchoredCirclesScreen";
import { AboutFooterLink } from "./AboutFooterLink";
import { OnboardingHeadline, OnboardingIntroBelow } from "./OnboardingIntroContent";
import { OnboardingPhasedContent } from "./OnboardingPhasedContent";
import { breathingRhythm, copyReveal, getOnboardingExplanationDelayMs } from "../animation-rhythm";
import { armFlowScreenEntryDelay } from "../flow-screen-transition";
import { markExtendedOnboardingCompleted } from "../../services/onboarding-gate";
import { isAppStoreScreenshotMode } from "../../modules/app-store-screenshot-mode";
import { uiCopy } from "../../modules/delivery-layer";
import { useRegisterCirclesPress } from "../../hooks/use-register-circles-press";

const EXIT_FADE_MS = breathingRhythm.motion.screenFadeMs;

export function ExtendedOnboardingFlow() {
  const router = useRouter();
  const captureMode = isAppStoreScreenshotMode();
  const lineCount = 1 + uiCopy.onboardingSteps.length;
  const [revealedLineCount, setRevealedLineCount] = useState(captureMode ? lineCount : 0);
  const [tapBurstReveal, setTapBurstReveal] = useState(captureMode);
  const [isExiting, setIsExiting] = useState(false);
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const stepRevealTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const allLinesRevealed = revealedLineCount >= lineCount;

  const cancelStepRevealTimers = useCallback(() => {
    stepRevealTimersRef.current.forEach(clearTimeout);
    stepRevealTimersRef.current = [];
  }, []);

  useEffect(() => {
    if (captureMode) {
      return;
    }

    cancelStepRevealTimers();
    const timers = Array.from({ length: lineCount }, (_, lineIndex) =>
      setTimeout(() => {
        setRevealedLineCount((count) => Math.max(count, lineIndex + 1));
      }, getOnboardingExplanationDelayMs(lineIndex)),
    );
    stepRevealTimersRef.current = timers;

    return cancelStepRevealTimers;
  }, [cancelStepRevealTimers, captureMode, lineCount]);

  const navigateToTrigger = useCallback(() => {
    if (isExiting) return;
    if (!captureMode) {
      markExtendedOnboardingCompleted();
    }
    setIsExiting(true);
    armFlowScreenEntryDelay(EXIT_FADE_MS);
    Animated.timing(contentOpacity, {
      toValue: 0,
      duration: EXIT_FADE_MS,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
    setTimeout(() => {
      router.replace("/trigger");
    }, copyReveal.fadeMs);
  }, [captureMode, contentOpacity, isExiting, router]);

  const onCirclesPress = useCallback(() => {
    if (isExiting) return;
    if (captureMode) {
      navigateToTrigger();
      return;
    }
    if (!allLinesRevealed) {
      cancelStepRevealTimers();
      setTapBurstReveal(true);
      setRevealedLineCount(lineCount);
      return;
    }
    navigateToTrigger();
  }, [
    allLinesRevealed,
    cancelStepRevealTimers,
    captureMode,
    isExiting,
    lineCount,
    navigateToTrigger,
  ]);
  useRegisterCirclesPress(onCirclesPress);

  return (
    <Animated.View style={[styles.root, { opacity: contentOpacity }]}>
      <AnchoredCirclesScreen
        footer={<AboutFooterLink label={uiCopy.aboutLink} onPress={() => router.push("/about")} />}
        centerContent={!captureMode}
        pinMainLikeTrigger={!captureMode}
        compactCapture={captureMode}
        mainLine={
          captureMode ? undefined : (
            <OnboardingPhasedContent
              revealedLineCount={revealedLineCount}
              tapBurstReveal={tapBurstReveal}
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
