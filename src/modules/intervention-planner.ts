import { InterventionType } from "../types/domain";
import { InterpretedState } from "./state-interpreter";

const interventions: InterventionType[] = [
  "feet_on_ground",
  "find_three_things",
  "triangle_breath",
];

export function planIntervention(state: InterpretedState): InterventionType {
  if (state.preferredByHour && !state.recentInterventions.slice(-2).includes(state.preferredByHour)) {
    return state.preferredByHour;
  }

  const sorted = [...interventions].sort((a, b) => {
    const aRate = state.completionRates[a] ?? 0.5;
    const bRate = state.completionRates[b] ?? 0.5;
    return bRate - aRate;
  });

  const nonRecent = sorted.find((i) => !state.recentInterventions.slice(-2).includes(i));
  return nonRecent ?? sorted[0];
}
