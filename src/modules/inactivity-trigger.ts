import { getSafetyState } from "../data/repositories/safety-repo";
import { getSchedulingProfile, recordScheduledInterval } from "../data/repositories/scheduling-profile-repo";
import { computeAdaptiveIntervalMinutes, explainInterval } from "./adaptive-scheduler";
import { checkEligibility } from "./eligibility-safety";

export const INACTIVITY_TRIGGER_MINUTES = 20;

const blockedPathPrefixes = ["/action", "/return"];

function parseOptionalEnvMinutes(raw: string | undefined): number | undefined {
  if (raw == null || String(raw).trim() === "") return undefined;
  const n = Number(raw);
  if (!Number.isFinite(n)) return undefined;
  return Math.max(0, n);
}

export function resolveAdaptiveIntervalMinutes(): number {
  const profile = getSchedulingProfile();
  const safety = getSafetyState();
  return computeAdaptiveIntervalMinutes(profile, safety).minutes;
}

export function getAdaptiveTriggerThresholdMinutes(): number {
  const minutes = resolveAdaptiveIntervalMinutes();
  recordScheduledInterval(minutes);
  return minutes;
}

export function getInactivityTriggerThresholdMinutes(): number {
  const envOverride = parseOptionalEnvMinutes(process.env.EXPO_PUBLIC_INACTIVITY_TRIGGER_MINUTES);
  if (envOverride !== undefined) return envOverride;

  try {
    return resolveAdaptiveIntervalMinutes();
  } catch {
    return INACTIVITY_TRIGGER_MINUTES;
  }
}

export function getInactivityNotificationDelaySeconds(thresholdMinutes?: number): number {
  const minutes = thresholdMinutes ?? getInactivityTriggerThresholdMinutes();
  return Math.max(1, Math.round(minutes * 60));
}

/** QA override: treat resume as N inactive minutes (only after a real background). */
export function resolveInactiveMinutesForTrigger(actualMinutes: number): number {
  const simulated = parseOptionalEnvMinutes(process.env.EXPO_PUBLIC_SIMULATED_INACTIVE_MINUTES);
  if (simulated !== undefined && actualMinutes > 0) return simulated;
  return actualMinutes;
}

function buildResumeSignal(inactiveMinutes: number) {
  return {
    timestamp: Date.now(),
    distractingSessionMinutes: Math.max(INACTIVITY_TRIGGER_MINUTES, inactiveMinutes),
    appCategory: "other" as const,
  };
}

export function shouldAutoOpenTrigger(inactiveMinutes: number): boolean {
  const resolved = resolveInactiveMinutesForTrigger(inactiveMinutes);
  if (resolved < getInactivityTriggerThresholdMinutes()) return false;

  try {
    const signal = buildResumeSignal(resolved);
    const eligibility = checkEligibility(signal, getSafetyState());
    return eligibility.eligible;
  } catch {
    return true;
  }
}

export function isPathBlockedForAutoTrigger(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return blockedPathPrefixes.some((prefix) => pathname.startsWith(prefix));
}

export function getSchedulingExplanation(): string {
  try {
    const profile = getSchedulingProfile();
    const safety = getSafetyState();
    const { factors } = computeAdaptiveIntervalMinutes(profile, safety);
    return explainInterval(factors);
  } catch {
    return `base ${INACTIVITY_TRIGGER_MINUTES}m`;
  }
}
