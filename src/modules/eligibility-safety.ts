import { isSameLocalDay } from "../data/repositories/safety-normalization";
import { SafetyState, UserSignal } from "../types/domain";

const minDistractingMinutes = 20;

function isQuietHour(nowHour: number, start: number, end: number) {
  return start > end ? nowHour >= start || nowHour < end : nowHour >= start && nowHour < end;
}

function isQuietHoursDisabled(safety: SafetyState) {
  return safety.quietHoursStart === safety.quietHoursEnd;
}

export function checkEligibility(signal: UserSignal, safety: SafetyState) {
  if (signal.distractingSessionMinutes < minDistractingMinutes) {
    return { eligible: false, reason: "session_too_short" };
  }

  const hour = new Date(signal.timestamp).getHours();
  if (
    !isQuietHoursDisabled(safety) &&
    isQuietHour(hour, safety.quietHoursStart, safety.quietHoursEnd)
  ) {
    return { eligible: false, reason: "quiet_hours" };
  }

  // Daily cap temporarily disabled — keep counting interventionsToday for
  // adaptive spacing / Paths, but do not block eligibility on the hard limit.
  // Re-enable with: safety.interventionsToday >= safety.dailyCap → "daily_cap".

  if (
    safety.lastInterventionAt &&
    isSameLocalDay(safety.lastInterventionAt, signal.timestamp)
  ) {
    const diffMinutes = (signal.timestamp - safety.lastInterventionAt) / 60000;
    if (diffMinutes < safety.cooldownMinutes) {
      return { eligible: false, reason: "cooldown" };
    }
  }

  // Dismissal hard-block removed — keep counting dismissalStreak / consecutiveIgnored
  // so ignored Pulsations only gently lengthen the next interval (+15m each), without
  // cutting off auto-open or the chance to switch back.
  // Re-enable with: safety.dismissalStreak >= 3 → "dismissal_dampening".

  return { eligible: true as const };
}
