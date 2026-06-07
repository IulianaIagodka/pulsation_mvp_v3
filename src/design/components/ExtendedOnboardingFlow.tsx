import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import { AnchoredCirclesScreen } from "./AnchoredCirclesScreen";
import { AboutFooterLink } from "./AboutFooterLink";
import { OnboardingHeadline, OnboardingIntroBelow } from "./OnboardingIntroContent";
import { getOnboardingCirclesHintDelayMs } from "../animation-rhythm";
import { uiCopy } from "../../modules/delivery-layer";
import { useRegisterCirclesHint } from "../../hooks/use-register-circles-hint";
import { useRegisterCirclesPress } from "../../hooks/use-register-circles-press";
import { useCirclesHintPresentation } from "../../hooks/use-circles-hint-presentation";
import { markExtendedOnboardingCompleted } from "../../services/onboarding-gate";
import { isAppStoreScreenshotMode } from "../../modules/app-store-screenshot-mode";

export function ExtendedOnboardingFlow() {
  const router = useRouter();
  const captureMode = isAppStoreScreenshotMode();
  const hintDelayMs = getOnboardingCirclesHintDelayMs(uiCopy.onboardingSteps.length);
  const circlesHintLive = useCirclesHintPresentation(hintDelayMs);
  const circlesHintPresentation = captureMode
    ? { shouldShow: true, delayMs: hintDelayMs, textOpacity: circlesHintLive.textOpacity }
    : circlesHintLive;

  const hintRegistration = useMemo(
    () => ({
      presentation: circlesHintPresentation,
      delayMs: hintDelayMs,
      label: uiCopy.onboardingCirclesHint,
      forceVisible: captureMode,
      holdAfterReveal: true,
    }),
    [captureMode, hintDelayMs, circlesHintPresentation],
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
      compactCapture={captureMode}
      belowEquator={captureMode ? undefined : <OnboardingIntroBelow />}
      mainLine={captureMode ? undefined : <OnboardingHeadline />}
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
