export type InterventionType = "feet_on_ground" | "find_three_things" | "triangle_breath";

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
  recentInterventions: InterventionType[];
};

export type InterventionDecision = {
  shouldDeliver: boolean;
  reason?: string;
  selected?: InterventionType;
};
