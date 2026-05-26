import { normalizeSafetyState } from "./safety-normalization";

describe("safety-repo daily reset rules", () => {
  it("resets daily counters when state is from previous day", () => {
    const previousDayTs = new Date(Date.now() - 24 * 60 * 60 * 1000).getTime();
    const normalized = normalizeSafetyState(
      {
        quietHoursStart: 23,
        quietHoursEnd: 7,
        dailyCap: 4,
        cooldownMinutes: 45,
        interventionsToday: 3,
        dismissalStreak: 2,
      },
      previousDayTs,
    );

    expect(normalized.interventionsToday).toBe(0);
    expect(normalized.dismissalStreak).toBe(0);
  });

  it("keeps counters for the same day", () => {
    const sameDayTs = Date.now() - 60 * 1000;
    const normalized = normalizeSafetyState(
      {
        quietHoursStart: 23,
        quietHoursEnd: 7,
        dailyCap: 4,
        cooldownMinutes: 45,
        interventionsToday: 2,
        dismissalStreak: 1,
      },
      sameDayTs,
    );

    expect(normalized.interventionsToday).toBe(2);
    expect(normalized.dismissalStreak).toBe(1);
  });
});
