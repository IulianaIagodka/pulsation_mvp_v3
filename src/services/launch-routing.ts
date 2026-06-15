import {
  consumeResumeSessionOnForeground,
  getResumeSessionSnapshot,
  type ResumeSessionSnapshot,
} from "../modules/session-runtime";
import { hasCompletedExtendedOnboarding } from "./onboarding-gate";
import { bootstrapPulsation } from "./pulsation-flow";

export type LaunchOnboardingKind = "extended" | "short" | "skip";

export function isLaunchOnboardingPath(pathname: string | null | undefined): boolean {
  return pathname === "/" || pathname === "/index" || pathname === "index";
}

function isWarmResume(resumeSession: ResumeSessionSnapshot | boolean): boolean {
  return typeof resumeSession === "boolean" ? resumeSession : resumeSession.warmResume;
}

/** Warm resume in the same process — skip headline, land on trigger. Cold start → short onboarding. */
export function shouldSkipLaunchOnboarding(
  resumeSession: ResumeSessionSnapshot = getResumeSessionSnapshot(),
): boolean {
  bootstrapPulsation();
  return resumeSession.warmResume;
}

/** First install → full onboarding; later cold starts → short headline; background → skip. */
export function resolveLaunchOnboardingKind(): LaunchOnboardingKind {
  const resumeSession = getResumeSessionSnapshot();
  if (shouldSkipLaunchOnboarding(resumeSession)) {
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
  resumeSession: ResumeSessionSnapshot | boolean = getResumeSessionSnapshot(),
): boolean {
  return isWarmResume(resumeSession) && isLaunchOnboardingPath(pathname);
}

export function clearLaunchOnboardingBackgroundFlag(): void {
  consumeResumeSessionOnForeground();
}
