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
  const noRecordedInterventionsYet =
    safety.lastInterventionAt == null && safety.interventionsToday === 0;
  if (
    !isQuietHoursDisabled(safety) &&
    !noRecordedInterventionsYet &&
    isQuietHour(hour, safety.quietHoursStart, safety.quietHoursEnd)
  ) {
    return { eligible: false, reason: "quiet_hours" };
  }

  if (safety.interventionsToday >= safety.dailyCap) {
    return { eligible: false, reason: "daily_cap" };
  }

  if (safety.lastInterventionAt) {
    const diffMinutes = (Date.now() - safety.lastInterventionAt) / 60000;
    if (diffMinutes < safety.cooldownMinutes) {
      return { eligible: false, reason: "cooldown" };
    }
  }

  if (safety.dismissalStreak >= 3) {
    return { eligible: false, reason: "dismissal_dampening" };
  }

  return { eligible: true as const };
}
