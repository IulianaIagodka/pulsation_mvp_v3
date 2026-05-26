export const INACTIVITY_TRIGGER_MINUTES = 20;

const blockedPathPrefixes = ["/action", "/explanation", "/return"];

function parseOptionalEnvMinutes(raw: string | undefined): number | undefined {
  if (raw == null || String(raw).trim() === "") return undefined;
  const n = Number(raw);
  if (!Number.isFinite(n)) return undefined;
  return Math.max(0, n);
}

export function getInactivityTriggerThresholdMinutes(): number {
  return (
    parseOptionalEnvMinutes(process.env.EXPO_PUBLIC_INACTIVITY_TRIGGER_MINUTES) ??
    INACTIVITY_TRIGGER_MINUTES
  );
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

export function shouldAutoOpenTrigger(inactiveMinutes: number): boolean {
  const resolved = resolveInactiveMinutesForTrigger(inactiveMinutes);
  return resolved >= getInactivityTriggerThresholdMinutes();
}

export function isPathBlockedForAutoTrigger(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return blockedPathPrefixes.some((prefix) => pathname.startsWith(prefix));
}
