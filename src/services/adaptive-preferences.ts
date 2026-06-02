import { InterventionType } from "../types/domain";
import { getOutcomesProfile, saveOutcomesProfile } from "../data/repositories/outcomes-repo";

export type AdaptivePreferenceConfig = {
  keepForMeBonus: number;
  dwellScoring: {
    longMs: number;
    mediumMs: number;
    shortMs: number;
    longBonus: number;
    mediumBonus: number;
    shortPenalty: number;
  };
  minScore: number;
  maxScore: number;
};

/** Lightweight, local-only engagement scoring used by intervention selection. */
export const adaptivePreferenceConfig: AdaptivePreferenceConfig = {
  keepForMeBonus: 10,
  dwellScoring: {
    longMs: 10_000,
    mediumMs: 5_000,
    shortMs: 1_000,
    longBonus: 3,
    mediumBonus: 1,
    shortPenalty: -1,
  },
  minScore: -10,
  maxScore: 100,
};

function clampScore(score: number): number {
  return Math.max(adaptivePreferenceConfig.minScore, Math.min(adaptivePreferenceConfig.maxScore, score));
}

export function scoreDwellTimeMs(dwellMs: number): number {
  const ms = Math.max(0, dwellMs);
  const { dwellScoring } = adaptivePreferenceConfig;
  if (ms > dwellScoring.longMs) return dwellScoring.longBonus;
  if (ms >= dwellScoring.mediumMs) return dwellScoring.mediumBonus;
  if (ms < dwellScoring.shortMs) return dwellScoring.shortPenalty;
  return 0;
}

export function hasKeptIntervention(intervention: InterventionType): boolean {
  const kept = getOutcomesProfile().keptInterventions ?? [];
  return kept.includes(intervention);
}

export function markInterventionKept(intervention: InterventionType): void {
  const profile = getOutcomesProfile();
  const kept = profile.keptInterventions ?? [];
  if (kept.includes(intervention)) return;
  saveOutcomesProfile({
    ...profile,
    keptInterventions: [...kept, intervention],
  });
}

export function registerExplanationEngagement(
  intervention: InterventionType,
  params: { keepForMeTapped: boolean; dwellMs: number },
): number {
  if (params.keepForMeTapped) {
    markInterventionKept(intervention);
  }

  const dwellDelta = scoreDwellTimeMs(params.dwellMs);
  const keepDelta = params.keepForMeTapped ? adaptivePreferenceConfig.keepForMeBonus : 0;
  const delta = dwellDelta + keepDelta;

  const profile = getOutcomesProfile();
  const previous = profile.preferenceScores?.[intervention] ?? 0;
  const updatedScore = clampScore(previous + delta);
  saveOutcomesProfile({
    ...profile,
    preferenceScores: {
      ...(profile.preferenceScores ?? {}),
      [intervention]: updatedScore,
    },
  });
  return updatedScore;
}
