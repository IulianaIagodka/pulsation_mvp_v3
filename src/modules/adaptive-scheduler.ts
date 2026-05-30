import { SafetyState, SchedulingProfile } from "../types/domain";

export const BASE_INTERVAL_MINUTES = 20;
export const MIN_INTERVAL_MINUTES = 18;
export const MAX_INTERVAL_MINUTES = 240;

const MS_PER_MINUTE = 60_000;
const MS_PER_DAY = 86_400_000;

export function daysSinceLastInteraction(profile: SchedulingProfile, now = Date.now()): number {
  const last = Math.max(profile.lastAppOpenAt ?? 0, profile.lastCompletedAt ?? 0);
  if (last === 0) return 0;
  return Math.floor((now - last) / MS_PER_DAY);
}

export type IntervalFactors = {
  baseMinutes: number;
  recentCompletionBonus: number;
  dailyCompletionBonus: number;
  ignoredStreakBonus: number;
  absenceBonus: number;
  recoveryReduction: number;
  jitterFactor: number;
  destaggerAdjustment: number;
  finalMinutes: number;
};

function destaggerInterval(minutes: number, lastInterval?: number): number {
  let result = Math.round(minutes);
  let adjustment = 0;

  if (result % 5 === 0) {
    adjustment += 2;
    result += 2;
  }
  if (result % 10 === 0) {
    adjustment += 3;
    result += 3;
  }
  if (lastInterval != null && Math.abs(result - lastInterval) < 4) {
    adjustment += 5;
    result += 5;
  }

  return adjustment;
}

/**
 * Computes the next Pulsation interval from lightweight local heuristics.
 * Longer intervals mean fewer invitations; randomness keeps timing organic.
 */
export function computeAdaptiveIntervalMinutes(
  profile: SchedulingProfile,
  safety: SafetyState,
  now = Date.now(),
  random: () => number = Math.random,
): { minutes: number; factors: IntervalFactors } {
  let interval = BASE_INTERVAL_MINUTES;
  let recentCompletionBonus = 0;
  let dailyCompletionBonus = 0;
  let ignoredStreakBonus = 0;
  let absenceBonus = 0;
  let recoveryReduction = 0;

  if (profile.lastCompletedAt) {
    const minutesSinceCompletion = (now - profile.lastCompletedAt) / MS_PER_MINUTE;
    if (minutesSinceCompletion < 60) {
      recentCompletionBonus = 30;
    } else if (minutesSinceCompletion < 120) {
      recentCompletionBonus = 12;
    }
    interval += recentCompletionBonus;
  }

  if (safety.interventionsToday >= 2) {
    dailyCompletionBonus = (safety.interventionsToday - 1) * 18;
    interval += dailyCompletionBonus;
  }

  if (profile.consecutiveIgnored >= 1) {
    ignoredStreakBonus = profile.consecutiveIgnored * 15;
    interval += ignoredStreakBonus;
  }

  const daysAbsent = daysSinceLastInteraction(profile, now);
  if (daysAbsent >= 3) {
    absenceBonus = Math.min(90, (daysAbsent - 2) * 25);
    interval += absenceBonus;
  }

  if (profile.lastAppOpenAt && profile.lastCompletedAt) {
    const daysAwayBeforeReturn = Math.floor(
      (profile.lastAppOpenAt - profile.lastCompletedAt) / MS_PER_DAY,
    );
    const hoursSinceReturn = (now - profile.lastAppOpenAt) / MS_PER_MINUTE / 60;
    if (daysAwayBeforeReturn >= 3 && hoursSinceReturn >= 0 && hoursSinceReturn < 48) {
      const dampeningAboveBase = interval - BASE_INTERVAL_MINUTES;
      recoveryReduction = dampeningAboveBase * 0.35 * Math.min(1, hoursSinceReturn / 24);
      interval -= recoveryReduction;
    }
  }

  interval = Math.max(BASE_INTERVAL_MINUTES, Math.min(MAX_INTERVAL_MINUTES, interval));

  const jitterFactor = 0.82 + random() * 0.36;
  interval *= jitterFactor;

  const destaggerAdjustment = destaggerInterval(interval, profile.lastScheduledIntervalMinutes);
  interval += destaggerAdjustment;

  const finalMinutes = Math.max(
    MIN_INTERVAL_MINUTES,
    Math.min(MAX_INTERVAL_MINUTES, Math.round(interval)),
  );

  return {
    minutes: finalMinutes,
    factors: {
      baseMinutes: BASE_INTERVAL_MINUTES,
      recentCompletionBonus,
      dailyCompletionBonus,
      ignoredStreakBonus,
      absenceBonus,
      recoveryReduction,
      jitterFactor,
      destaggerAdjustment,
      finalMinutes,
    },
  };
}

export function explainInterval(factors: IntervalFactors): string {
  const parts: string[] = [`base ${factors.baseMinutes}m`];
  if (factors.recentCompletionBonus > 0) {
    parts.push(`+${factors.recentCompletionBonus}m recent completion`);
  }
  if (factors.dailyCompletionBonus > 0) {
    parts.push(`+${factors.dailyCompletionBonus}m daily activity`);
  }
  if (factors.ignoredStreakBonus > 0) {
    parts.push(`+${factors.ignoredStreakBonus}m ignored streak`);
  }
  if (factors.absenceBonus > 0) {
    parts.push(`+${factors.absenceBonus}m absence`);
  }
  if (factors.recoveryReduction > 0) {
    parts.push(`−${Math.round(factors.recoveryReduction)}m return recovery`);
  }
  parts.push(`×${factors.jitterFactor.toFixed(2)} jitter`);
  if (factors.destaggerAdjustment > 0) {
    parts.push(`+${factors.destaggerAdjustment}m destagger`);
  }
  parts.push(`→ ${factors.finalMinutes}m`);
  return parts.join(", ");
}
