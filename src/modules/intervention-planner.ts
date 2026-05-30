import { InterventionType } from "../types/domain";
import { InterpretedState } from "./state-interpreter";

export const ALL_INTERVENTIONS: readonly InterventionType[] = [
  "feet_on_ground",
  "find_three_things",
  "triangle_breath",
  "relax_jaw",
  "drop_shoulders",
  "notice_three_sounds",
  "press_palms_together",
] as const;

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

function poolForHour(hour: number): readonly InterventionType[] {
  if (hour >= 5 && hour < 11) return TIME_OF_DAY_POOLS.morning;
  if (hour >= 11 && hour < 17) return TIME_OF_DAY_POOLS.daytime;
  if (hour >= 17 && hour < 22) return TIME_OF_DAY_POOLS.evening;
  return TIME_OF_DAY_POOLS.night;
}

/** Picks one action from the time-of-day pool (weighted evenly within the pool). */
export function getTimeOfDayPreference(
  hour: number,
  random: () => number = Math.random,
): InterventionType | undefined {
  const pool = poolForHour(hour);
  const index = Math.floor(random() * pool.length);
  return pool[index];
}

export function planIntervention(state: InterpretedState, options?: PlannerOptions): InterventionType {
  const random = options?.random ?? Math.random;
  const recentLast2 = state.recentInterventions.slice(-2);

  if (random() < 0.15) {
    const leastUsed = [...ALL_INTERVENTIONS].sort((a, b) => {
      const aRate = state.completionRates[a] ?? 0.5;
      const bRate = state.completionRates[b] ?? 0.5;
      return aRate - bRate;
    });
    const varietyPick = leastUsed.find((i) => !recentLast2.includes(i));
    if (varietyPick) return varietyPick;
  }

  const timePref = getTimeOfDayPreference(state.hour, random);
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

  const nonRecent = sorted.find((i) => !recentLast2.includes(i));
  return nonRecent ?? sorted[0];
}
