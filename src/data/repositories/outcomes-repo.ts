import { OutcomesProfile } from "../../types/domain";
import { getDb } from "../db";

const primaryId = "primary";

function getInitialOutcomesProfile(): OutcomesProfile {
  return {
    preferredByHour: {},
    completionRates: {},
    recentInterventions: [],
  };
}

function safeParseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function getOutcomesProfile(): OutcomesProfile {
  try {
    const row = getDb().getFirstSync<any>(
      "SELECT * FROM outcomes_profile WHERE id = ?",
      primaryId,
    );
    if (!row) {
      const initial = getInitialOutcomesProfile();
      saveOutcomesProfile(initial);
      return initial;
    }
    return {
      preferredByHour: safeParseJson(row.preferred_by_hour, {}),
      completionRates: safeParseJson(row.completion_rates, {}),
      recentInterventions: safeParseJson(row.recent_interventions, []),
      lastFindThreeVariantIndex:
        row.last_find_three_variant != null ? Number(row.last_find_three_variant) : undefined,
      onboardingCompleted: Boolean(row.onboarding_completed),
    };
  } catch (error) {
    console.warn("[outcomes-repo] Failed to read outcomes profile:", error);
    return getInitialOutcomesProfile();
  }
}

export function saveOutcomesProfile(profile: OutcomesProfile) {
  try {
    const existing = getDb().getFirstSync<{
      last_find_three_variant: number | null;
      onboarding_completed: number;
    }>("SELECT last_find_three_variant, onboarding_completed FROM outcomes_profile WHERE id = ?", primaryId);

    const lastFindThreeVariant =
      profile.lastFindThreeVariantIndex !== undefined
        ? profile.lastFindThreeVariantIndex
        : (existing?.last_find_three_variant ?? null);

    const onboardingCompleted =
      profile.onboardingCompleted !== undefined
        ? profile.onboardingCompleted
          ? 1
          : 0
        : (existing?.onboarding_completed ?? 0);

    getDb().runSync(
      `INSERT OR REPLACE INTO outcomes_profile
      (id, preferred_by_hour, completion_rates, recent_interventions, last_find_three_variant, onboarding_completed, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        primaryId,
        JSON.stringify(profile.preferredByHour),
        JSON.stringify(profile.completionRates),
        JSON.stringify(profile.recentInterventions),
        lastFindThreeVariant,
        onboardingCompleted,
        Date.now(),
      ],
    );
  } catch (error) {
    console.warn("[outcomes-repo] Failed to save outcomes profile:", error);
  }
}
