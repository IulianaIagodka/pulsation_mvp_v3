import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnchoredCirclesScreen } from "./AnchoredCirclesScreen";
import { AboutFooterLink } from "./AboutFooterLink";
import { OnboardingHeadline, OnboardingIntroBelow } from "./OnboardingIntroContent";
import { OnboardingPhasedContent } from "./OnboardingPhasedContent";
import { copyReveal, getOnboardingCirclesHintDelayMs } from "../animation-rhythm";
import { uiCopy } from "../../modules/delivery-layer";
import { useRegisterCirclesHint } from "../../hooks/use-register-circles-hint";
import { useRegisterCirclesPress } from "../../hooks/use-register-circles-press";
import { useCirclesHintPresentation } from "../../hooks/use-circles-hint-presentation";
import { markExtendedOnboardingCompleted } from "../../services/onboarding-gate";
import { isAppStoreScreenshotMode } from "../../modules/app-store-screenshot-mode";

export function ExtendedOnboardingFlow() {
  const router = useRouter();
  const captureMode = isAppStoreScreenshotMode();
  const hintUnlockAtMs = getOnboardingCirclesHintDelayMs(uiCopy.onboardingSteps.length);
  const [hintUnlocked, setHintUnlocked] = useState(captureMode);
  const circlesHintLive = useCirclesHintPresentation(hintUnlockAtMs);
  const circlesHintPresentation = captureMode
    ? { shouldShow: true, delayMs: hintUnlockAtMs, textOpacity: circlesHintLive.textOpacity }
    : circlesHintLive;

  useEffect(() => {
    if (captureMode) {
      setHintUnlocked(true);
      return;
    }
    setHintUnlocked(false);
    const timer = setTimeout(() => setHintUnlocked(true), hintUnlockAtMs);
    return () => clearTimeout(timer);
  }, [captureMode, hintUnlockAtMs]);

  const hintRegistration = useMemo(
    () => ({
      presentation: circlesHintPresentation,
      visible: captureMode || hintUnlocked,
      delayMs: copyReveal.lineGapMs,
      fadeMs: copyReveal.fadeMs,
      label: uiCopy.onboardingCirclesHint,
      forceVisible: captureMode,
      holdAfterReveal: true,
    }),
    [captureMode, hintUnlocked, circlesHintPresentation],
  );
  useRegisterCirclesHint(hintRegistration);

  const onCirclesPress = useCallback(() => {
    markExtendedOnboardingCompleted();
    router.replace("/trigger");
  }, [router]);
  useRegisterCirclesPress(onCirclesPress);

  return (
    <AnchoredCirclesScreen
      footer={<AboutFooterLink label={uiCopy.aboutLink} onPress={() => router.push("/about")} />}
      centerContent={!captureMode}
      pinMainLikeTrigger={!captureMode}
      expandMainToFooter={!captureMode}
      compactCapture={captureMode}
      mainLine={captureMode ? undefined : <OnboardingPhasedContent />}
    >
      {captureMode ? (
        <>
          <OnboardingHeadline />
          <OnboardingIntroBelow />
        </>
      ) : null}
    </AnchoredCirclesScreen>
  );
}
