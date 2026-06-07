import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import { AnchoredCirclesScreen } from "./AnchoredCirclesScreen";
import { AboutFooterLink } from "./AboutFooterLink";
import { ExplanationText } from "./ExplanationText";
import { getOnboardingCirclesHintDelayMs } from "../animation-rhythm";
import { uiCopy } from "../../modules/delivery-layer";
import { useRegisterCirclesHint } from "../../hooks/use-register-circles-hint";
import { useRegisterCirclesPress } from "../../hooks/use-register-circles-press";
import { useCirclesHintPresentation } from "../../hooks/use-circles-hint-presentation";
import { markExtendedOnboardingCompleted } from "../../services/onboarding-gate";

export function ShortOnboardingFlow() {
  const router = useRouter();
  const hintDelayMs = getOnboardingCirclesHintDelayMs(0);
  const circlesHintPresentation = useCirclesHintPresentation(hintDelayMs);
  const hintRegistration = useMemo(
    () => ({
      presentation: circlesHintPresentation,
      delayMs: hintDelayMs,
      label: uiCopy.onboardingCirclesHint,
      holdAfterReveal: true,
    }),
    [hintDelayMs, circlesHintPresentation],
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
      pinMainLikeTrigger
      mainLine={
        <ExplanationText variant="main" holdAfterReveal>
          {uiCopy.onboardingLine}
        </ExplanationText>
      }
    />
  );
}
