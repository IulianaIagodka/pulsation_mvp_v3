import { InterventionType, OutcomesProfile } from "../types/domain";

export function updateMemory(
  profile: OutcomesProfile,
  intervention: InterventionType,
  completed: boolean,
  at: number,
): OutcomesProfile {
  const hour = new Date(at).getHours();
  const previousRate = profile.completionRates[intervention] ?? 0.5;
  const updatedRate = previousRate * 0.7 + (completed ? 1 : 0) * 0.3;

  const recent = [...profile.recentInterventions, intervention].slice(-8);

  return {
    preferredByHour: {
      ...profile.preferredByHour,
      [hour]: completed ? intervention : profile.preferredByHour[hour],
    },
    completionRates: {
      ...profile.completionRates,
      [intervention]: updatedRate,
    },
    recentInterventions: recent,
  };
}
