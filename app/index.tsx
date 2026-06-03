import { Redirect } from "expo-router";
import { ExtendedOnboardingFlow } from "../src/design/components/ExtendedOnboardingFlow";
import { hasCompletedExtendedOnboarding } from "../src/services/onboarding-gate";

export default function OnboardingScreen() {
  if (hasCompletedExtendedOnboarding()) {
    return <Redirect href="/trigger" />;
  }

  return <ExtendedOnboardingFlow />;
}
