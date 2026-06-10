import { getOutcomesProfile, saveOutcomesProfile } from "../data/repositories/outcomes-repo";
import { bootstrapPulsation } from "./pulsation-flow";

export function hasCompletedExtendedOnboarding(): boolean {
  bootstrapPulsation();
  const profile = getOutcomesProfile();
  return profile.extendedOnboardingCompleted === true || profile.onboardingCompleted === true;
}

export function markExtendedOnboardingCompleted(): void {
  bootstrapPulsation();
  const profile = getOutcomesProfile();
  saveOutcomesProfile({
    ...profile,
    extendedOnboardingCompleted: true,
    onboardingCompleted: true,
  });
}

