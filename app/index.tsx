import { useEffect, useState } from "react";
import { ExtendedOnboardingFlow } from "../src/design/components/ExtendedOnboardingFlow";
import { ShortOnboardingFlow } from "../src/design/components/ShortOnboardingFlow";
import { hasCompletedExtendedOnboarding } from "../src/services/onboarding-gate";

export default function OnboardingScreen() {
  const [gateChecked, setGateChecked] = useState(false);
  const [showExtended, setShowExtended] = useState(true);

  useEffect(() => {
    setShowExtended(!hasCompletedExtendedOnboarding());
    setGateChecked(true);
  }, []);

  if (!gateChecked) {
    return null;
  }

  if (showExtended) {
    return <ExtendedOnboardingFlow />;
  }

  return <ShortOnboardingFlow />;
}
