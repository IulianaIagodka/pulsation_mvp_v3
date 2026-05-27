import { getOutcomesProfile, saveOutcomesProfile } from "../data/repositories/outcomes-repo";
import { bootstrapPulsation } from "./pulsation-flow";

export function hasCompletedOnboarding(): boolean {
  bootstrapPulsation();
  return getOutcomesProfile().onboardingCompleted === true;
}

export function markOnboardingCompleted(): void {
  bootstrapPulsation();
  const profile = getOutcomesProfile();
  saveOutcomesProfile({ ...profile, onboardingCompleted: true });
}
