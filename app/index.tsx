import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { ExtendedOnboardingFlow } from "../src/design/components/ExtendedOnboardingFlow";
import { hasCompletedExtendedOnboarding } from "../src/services/onboarding-gate";

export default function OnboardingScreen() {
  const router = useRouter();
  const [gateChecked, setGateChecked] = useState(false);

  useEffect(() => {
    if (hasCompletedExtendedOnboarding()) {
      router.replace("/trigger");
      return;
    }
    setGateChecked(true);
  }, [router]);

  if (!gateChecked) {
    return null;
  }

  return <ExtendedOnboardingFlow />;
}
