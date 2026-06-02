import { InterventionType, OutcomesProfile } from "../../types/domain";
import { getDb } from "../db";

const primaryId = "primary";

function getInitialOutcomesProfile(): OutcomesProfile {
  return {
    preferredByHour: {},
    completionRates: {},
    preferenceScores: {},
    keptInterventions: [],
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
      preferenceScores: safeParseJson(row.preference_scores ?? "{}", {}),
      keptInterventions: safeParseJson<InterventionType[]>(row.kept_interventions ?? "[]", []),
      recentInterventions: safeParseJson(row.recent_interventions, []),
      lastFindThreeVariantIndex:
        row.last_find_three_variant != null ? Number(row.last_find_three_variant) : undefined,
      onboardingCompleted: Boolean(row.onboarding_completed),
      extendedOnboardingCompleted: Boolean(row.extended_onboarding_completed),
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
      extended_onboarding_completed: number | null;
      kept_interventions: string | null;
    }>(
      "SELECT last_find_three_variant, onboarding_completed, extended_onboarding_completed, kept_interventions FROM outcomes_profile WHERE id = ?",
      primaryId,
    );

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

    const extendedOnboardingCompleted =
      profile.extendedOnboardingCompleted !== undefined
        ? profile.extendedOnboardingCompleted
          ? 1
          : 0
        : (existing?.extended_onboarding_completed ?? 0);

    const keptInterventions =
      profile.keptInterventions !== undefined
        ? profile.keptInterventions
        : safeParseJson<InterventionType[]>(existing?.kept_interventions ?? "[]", []);

    getDb().runSync(
      `INSERT OR REPLACE INTO outcomes_profile
      (id, preferred_by_hour, completion_rates, preference_scores, kept_interventions, recent_interventions, last_find_three_variant, onboarding_completed, extended_onboarding_completed, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        primaryId,
        JSON.stringify(profile.preferredByHour),
        JSON.stringify(profile.completionRates),
        JSON.stringify(profile.preferenceScores ?? {}),
        JSON.stringify(keptInterventions),
        JSON.stringify(profile.recentInterventions),
        lastFindThreeVariant,
        onboardingCompleted,
        extendedOnboardingCompleted,
        Date.now(),
      ],
    );
  } catch (error) {
    console.warn("[outcomes-repo] Failed to save outcomes profile:", error);
  }
}
