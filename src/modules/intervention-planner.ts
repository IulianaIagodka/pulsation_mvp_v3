import { InterventionType } from "../types/domain";
import { ALL_INTERVENTIONS } from "../interventions/registry";
import { InterpretedState } from "./state-interpreter";

export { ALL_INTERVENTIONS } from "../interventions/registry";
/** Morning grounding, daytime sensory awareness, evening breathing + calm body. */
export const TIME_OF_DAY_POOLS = {
  morning: [
    "feet_on_ground",
    "relax_jaw",
    "drop_shoulders",
    "press_palms_together",
  ] as const satisfies readonly InterventionType[],
  daytime: ["find_three_things", "notice_three_sounds"] as const satisfies readonly InterventionType[],
  evening: ["triangle_breath", "relax_jaw", "press_palms_together"] as const satisfies readonly InterventionType[],
  night: ["triangle_breath", "press_palms_together"] as const satisfies readonly InterventionType[],
};

export type PlannerOptions = {
  /** 0–1; defaults to Math.random */
  random?: () => number;
};

export type PreferenceWeightConfig = {
  baseWeight: number;
  thresholds: readonly { minScore: number; weight: number }[];
};

/**
 * Converts local preference score to weighted-random strength.
 * Keeps every intervention eligible with at least `baseWeight`.
 */
export const preferenceWeightConfig: PreferenceWeightConfig = {
  baseWeight: 1,
  thresholds: [
    { minScore: 3, weight: 2 },
    { minScore: 6, weight: 3 },
    { minScore: 10, weight: 4 },
  ],
};

function poolForHour(hour: number): readonly InterventionType[] {
  if (hour >= 5 && hour < 11) return TIME_OF_DAY_POOLS.morning;
  if (hour >= 11 && hour < 17) return TIME_OF_DAY_POOLS.daytime;
  if (hour >= 17 && hour < 22) return TIME_OF_DAY_POOLS.evening;
  return TIME_OF_DAY_POOLS.night;
}

function scoreToWeight(score: number | undefined, config: PreferenceWeightConfig = preferenceWeightConfig): number {
  const safeScore = Number.isFinite(score) ? Math.max(0, Number(score)) : 0;
  let weight = config.baseWeight;
  for (const step of config.thresholds) {
    if (safeScore >= step.minScore) weight = step.weight;
  }
  return Math.max(1, weight);
}

function weightedRandomPick(
  candidates: readonly InterventionType[],
  scores: Partial<Record<InterventionType, number>>,
  random: () => number,
): InterventionType | undefined {
  if (candidates.length === 0) return undefined;
  const weighted = candidates.map((intervention) => ({
    intervention,
    weight: scoreToWeight(scores[intervention]),
  }));
  const total = weighted.reduce((sum, item) => sum + item.weight, 0);
  if (total <= 0) return weighted[0]?.intervention;

  let roll = random() * total;
  for (const item of weighted) {
    roll -= item.weight;
    if (roll <= 0) return item.intervention;
  }
  return weighted[weighted.length - 1]?.intervention;
}

/** Picks one action from the time-of-day pool with subtle local preference weighting. */
export function getTimeOfDayPreference(
  hour: number,
  random: () => number = Math.random,
  scores: Partial<Record<InterventionType, number>> = {},
): InterventionType | undefined {
  const pool = poolForHour(hour);
  return weightedRandomPick(pool, scores, random);
}

export function planIntervention(state: InterpretedState, options?: PlannerOptions): InterventionType {
  const random = options?.random ?? Math.random;
  const recentLast2 = state.recentInterventions.slice(-2);
  const nonRecentInterventions = ALL_INTERVENTIONS.filter((i) => !recentLast2.includes(i));

  if (random() < 0.15) {
    const leastUsed = [...ALL_INTERVENTIONS].sort((a, b) => {
      const aRate = state.completionRates[a] ?? 0.5;
      const bRate = state.completionRates[b] ?? 0.5;
      return aRate - bRate;
    });
    const varietyPick = leastUsed.find((i) => !recentLast2.includes(i));
    if (varietyPick) return varietyPick;
  }

  const timePref = getTimeOfDayPreference(state.hour, random, state.preferenceScores ?? {});
  if (timePref && !recentLast2.includes(timePref) && random() < 0.65) {
    return timePref;
  }

  if (state.preferredByHour && !recentLast2.includes(state.preferredByHour)) {
    return state.preferredByHour;
  }

  const sorted = [...ALL_INTERVENTIONS].sort((a, b) => {
    const aRate = state.completionRates[a] ?? 0.5;
    const bRate = state.completionRates[b] ?? 0.5;
    return bRate - aRate;
  });

  // Final fallback: weighted random biased by learned local preference scores.
  const weightedPick = weightedRandomPick(
    nonRecentInterventions.length > 0 ? nonRecentInterventions : sorted,
    state.preferenceScores ?? {},
    random,
  );
  if (weightedPick) return weightedPick;

  const nonRecent = sorted.find((i) => !recentLast2.includes(i));
  return nonRecent ?? sorted[0];
}
