import { useRouter } from "expo-router";
import { useCallback } from "react";
import { AnchoredSpiralScreen } from "./AnchoredSpiralScreen";
import { AboutFooterLink } from "./AboutFooterLink";
import { OnboardingHeadline, OnboardingIntroBelow } from "./OnboardingIntroContent";
import { uiCopy } from "../../modules/delivery-layer";
import { useRegisterSpiralPress } from "../../hooks/use-register-spiral-press";
import { markExtendedOnboardingCompleted } from "../../services/onboarding-gate";

export function ExtendedOnboardingFlow() {
  const router = useRouter();

  const onSpiralPress = useCallback(() => {
    markExtendedOnboardingCompleted();
    router.replace("/trigger");
  }, [router]);
  useRegisterSpiralPress(onSpiralPress);

  return (
    <AnchoredSpiralScreen
      footer={<AboutFooterLink label={uiCopy.aboutLink} onPress={() => router.push("/about")} />}
      belowEquator={<OnboardingIntroBelow />}
    >
      <OnboardingHeadline />
    </AnchoredSpiralScreen>
  );
}
