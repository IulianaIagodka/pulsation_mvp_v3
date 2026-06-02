import { InterventionType, OutcomesProfile, UserSignal } from "../types/domain";

export type InterpretedState = {
  hour: number;
  preferredByHour?: InterventionType;
  completionRates: Partial<Record<InterventionType, number>>;
  preferenceScores: Partial<Record<InterventionType, number>>;
  recentInterventions: InterventionType[];
  signalWeight: number;
};

export function interpretState(signal: UserSignal, outcomes: OutcomesProfile): InterpretedState {
  const hour = new Date(signal.timestamp).getHours();
  const signalWeight = Math.min(1, signal.distractingSessionMinutes / 60);

  return {
    hour,
    preferredByHour: outcomes.preferredByHour[hour],
    completionRates: outcomes.completionRates,
    preferenceScores: outcomes.preferenceScores ?? {},
    recentInterventions: outcomes.recentInterventions,
    signalWeight,
  };
}
