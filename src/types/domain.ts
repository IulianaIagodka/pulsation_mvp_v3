import type { InterventionType } from "../interventions/registry";

export type { InterventionType };
export type UserSignal = {
  timestamp: number;
  distractingSessionMinutes: number;
  appCategory: "social" | "video" | "news" | "other";
};

export type SafetyState = {
  quietHoursStart: number;
  quietHoursEnd: number;
  dailyCap: number;
  cooldownMinutes: number;
  interventionsToday: number;
  lastInterventionAt?: number;
  dismissalStreak: number;
};

export type OutcomesProfile = {
  preferredByHour: Partial<Record<number, InterventionType>>;
  completionRates: Partial<Record<InterventionType, number>>;
  /** Lightweight local affinity signal used for weighted random picks. */
  preferenceScores: Partial<Record<InterventionType, number>>;
  /** Interventions the user saved via "Keep this one for me". */
  keptInterventions?: InterventionType[];
  recentInterventions: InterventionType[];
  /** Last “find 3 things” prompt set (0–6); avoids repeating the same combo back-to-back. */
  lastFindThreeVariantIndex?: number;
  /** Legacy flag; set on first spiral tap from onboarding. */
  onboardingCompleted?: boolean;
  /** First install: multi-step intro completed. */
  extendedOnboardingCompleted?: boolean;
};

/** Local engagement signals that drive adaptive Pulsation timing. */
export type SchedulingProfile = {
  lastAppOpenAt?: number;
  lastCompletedAt?: number;
  consecutiveIgnored: number;
  totalCompleted: number;
  completionsByType: Partial<Record<InterventionType, number>>;
  completionsByHour: Partial<Record<number, number>>;
  lastScheduledIntervalMinutes?: number;
};

export type InterventionDecision = {
  shouldDeliver: boolean;
  reason?: string;
  selected?: InterventionType;
};
