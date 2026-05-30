export type InterventionType =
  | "feet_on_ground"
  | "find_three_things"
  | "triangle_breath"
  | "relax_jaw"
  | "drop_shoulders"
  | "notice_three_sounds"
  | "press_palms_together";

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
  /** Last “find 3 things” prompt set (0–6); avoids repeating the same combo back-to-back. */
  lastFindThreeVariantIndex?: number;
  /** Shown once; after first spiral tap on onboarding. */
  onboardingCompleted?: boolean;
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
