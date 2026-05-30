import { getOutcomesProfile } from "../data/repositories/outcomes-repo";
import { getSafetyState } from "../data/repositories/safety-repo";
import { InterventionDecision } from "../types/domain";
import { checkEligibility } from "./eligibility-safety";
import { planIntervention } from "./intervention-planner";
import { interpretState } from "./state-interpreter";

export function runTriggerEngine(signal: Parameters<typeof checkEligibility>[0]): InterventionDecision {
  const safety = getSafetyState();
  const eligibility = checkEligibility(signal, safety);
  const outcomes = getOutcomesProfile();
  const interpreted = interpretState(signal, outcomes);
  const selected = planIntervention(interpreted);

  if (!eligibility.eligible) {
    return { shouldDeliver: false, reason: eligibility.reason, selected };
  }

  return { shouldDeliver: true, selected };
}
