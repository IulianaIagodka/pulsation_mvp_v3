import { clearAppBackgrounded } from "../data/repositories/scheduling-profile-repo";
import { isWarmProcessResume } from "../modules/session-runtime";
import { hasCompletedExtendedOnboarding } from "./onboarding-gate";
import { bootstrapPulsation } from "./pulsation-flow";

export type LaunchOnboardingKind = "extended" | "short" | "skip";

export function isLaunchOnboardingPath(pathname: string | null | undefined): boolean {
  return pathname === "/" || pathname === "/index" || pathname === "index";
}

/** Warm resume in the same process — skip headline, land on trigger. Cold start → short onboarding. */
export function shouldSkipLaunchOnboarding(): boolean {
  bootstrapPulsation();
  return isWarmProcessResume();
}

/** First install → full onboarding; later cold starts → short headline; background → skip. */
export function resolveLaunchOnboardingKind(): LaunchOnboardingKind {
  if (shouldSkipLaunchOnboarding()) {
    return "skip";
  }
  if (!hasCompletedExtendedOnboarding()) {
    return "extended";
  }
  return "short";
}

/** Resume from background while the launch headline is visible — go to trigger. */
export function shouldLeaveLaunchOnboardingOnResume(
  pathname: string | null | undefined,
  warmResume = isWarmProcessResume(),
): boolean {
  return warmResume && isLaunchOnboardingPath(pathname);
}

export function clearLaunchOnboardingBackgroundFlag(): void {
  clearAppBackgrounded();
}
