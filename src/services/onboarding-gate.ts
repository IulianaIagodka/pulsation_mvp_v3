import { getOutcomesProfile, saveOutcomesProfile } from "../data/repositories/outcomes-repo";
import { bootstrapPulsation } from "./pulsation-flow";

export function hasCompletedExtendedOnboarding(): boolean {
  bootstrapPulsation();
  return getOutcomesProfile().extendedOnboardingCompleted === true;
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

/** @deprecated Use hasCompletedExtendedOnboarding for first-install gating. */
export function hasCompletedOnboarding(): boolean {
  bootstrapPulsation();
  return getOutcomesProfile().onboardingCompleted === true;
}

export function markOnboardingCompleted(): void {
  bootstrapPulsation();
  const profile = getOutcomesProfile();
  saveOutcomesProfile({
    ...profile,
    onboardingCompleted: true,
    extendedOnboardingCompleted: true,
  });
}
