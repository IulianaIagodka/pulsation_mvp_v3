import { getDb } from "../db";
import { SafetyState } from "../../types/domain";
import { normalizeSafetyState } from "./safety-normalization";

const primaryId = "primary";

function getInitialSafetyState(): SafetyState {
  return {
    // start === end means quiet hours off (see eligibility-safety)
    quietHoursStart: 0,
    quietHoursEnd: 0,
    dailyCap: 4,
    cooldownMinutes: 45,
    interventionsToday: 0,
    dismissalStreak: 0,
  };
}

export function getSafetyState(): SafetyState {
  try {
    const row = getDb().getFirstSync<any>(
      "SELECT * FROM safety_state WHERE id = ?",
      primaryId,
    );
    if (!row) {
      const initial = getInitialSafetyState();
      saveSafetyState(initial);
      return initial;
    }
    const restored: SafetyState = {
      quietHoursStart: row.quiet_hours_start,
      quietHoursEnd: row.quiet_hours_end,
      dailyCap: row.daily_cap,
      cooldownMinutes: row.cooldown_minutes,
      interventionsToday: row.interventions_today,
      lastInterventionAt: row.last_intervention_at ?? undefined,
      dismissalStreak: row.dismissal_streak,
    };
    const normalized = normalizeSafetyState(restored, row.updated_at ?? undefined);
    if (
      normalized.interventionsToday !== restored.interventionsToday ||
      normalized.dismissalStreak !== restored.dismissalStreak
    ) {
      saveSafetyState(normalized);
    }
    return normalized;
  } catch (error) {
    console.warn("[safety-repo] Failed to read safety state:", error);
    return getInitialSafetyState();
  }
}

export function saveSafetyState(state: SafetyState) {
  try {
    getDb().runSync(
      `INSERT OR REPLACE INTO safety_state (
        id, quiet_hours_start, quiet_hours_end, daily_cap, cooldown_minutes, interventions_today,
        last_intervention_at, dismissal_streak, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        primaryId,
        state.quietHoursStart,
        state.quietHoursEnd,
        state.dailyCap,
        state.cooldownMinutes,
        state.interventionsToday,
        state.lastInterventionAt ?? null,
        state.dismissalStreak,
        Date.now(),
      ],
    );
  } catch (error) {
    console.warn("[safety-repo] Failed to save safety state:", error);
  }
}
