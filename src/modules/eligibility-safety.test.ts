import { checkEligibility } from "./eligibility-safety";

describe("checkEligibility", () => {
  it("blocks during cooldown", () => {
    const now = new Date("2026-06-05T14:00:00").getTime();
    const result = checkEligibility(
      { timestamp: now, distractingSessionMinutes: 30, appCategory: "social" },
      {
        quietHoursStart: 0,
        quietHoursEnd: 0,
        dailyCap: 4,
        cooldownMinutes: 60,
        interventionsToday: 1,
        lastInterventionAt: now - 10 * 60000,
        dismissalStreak: 0,
      },
    );

    expect(result).toEqual({ eligible: false, reason: "cooldown" });
  });

  it("allows the first prompt even during quiet hours", () => {
    const duringQuietHours = new Date("2026-06-01T02:00:00").getTime();
    const result = checkEligibility(
      { timestamp: duringQuietHours, distractingSessionMinutes: 30, appCategory: "social" },
      {
        quietHoursStart: 23,
        quietHoursEnd: 7,
        dailyCap: 4,
        cooldownMinutes: 60,
        interventionsToday: 0,
        dismissalStreak: 0,
      },
    );

    expect(result).toEqual({ eligible: true });
  });

  it("blocks quiet hours after any recorded intervention", () => {
    const duringQuietHours = new Date("2026-06-01T02:00:00").getTime();
    const result = checkEligibility(
      { timestamp: duringQuietHours, distractingSessionMinutes: 30, appCategory: "social" },
      {
        quietHoursStart: 23,
        quietHoursEnd: 7,
        dailyCap: 4,
        cooldownMinutes: 60,
        interventionsToday: 1,
        lastInterventionAt: Date.now() - 120 * 60000,
        dismissalStreak: 0,
      },
    );

    expect(result).toEqual({ eligible: false, reason: "quiet_hours" });
  });

  it("treats equal start/end as quiet hours disabled", () => {
    const duringQuietHours = new Date("2026-06-01T02:00:00").getTime();
    const result = checkEligibility(
      { timestamp: duringQuietHours, distractingSessionMinutes: 30, appCategory: "social" },
      {
        quietHoursStart: 0,
        quietHoursEnd: 0,
        dailyCap: 4,
        cooldownMinutes: 60,
        interventionsToday: 2,
        lastInterventionAt: Date.now() - 120 * 60000,
        dismissalStreak: 0,
      },
    );

    expect(result).toEqual({ eligible: true });
  });
});
