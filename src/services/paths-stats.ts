import { getOutcomesProfile } from "../data/repositories/outcomes-repo";
import { getSafetyState } from "../data/repositories/safety-repo";
import type { InterventionType } from "../types/domain";

export type PathsSnapshot = {
  keptInterventions: InterventionType[];
  actionsToday: number;
};

export function getPathsSnapshot(): PathsSnapshot {
  const profile = getOutcomesProfile();
  const safety = getSafetyState();
  return {
    keptInterventions: profile.keptInterventions ?? [],
    actionsToday: safety.interventionsToday,
  };
}
