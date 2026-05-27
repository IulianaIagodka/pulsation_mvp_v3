import { updateMemory } from "./memory-update";

describe("updateMemory", () => {
  it("keeps onboardingCompleted and find-three variant index", () => {
    const profile = {
      preferredByHour: {},
      completionRates: {},
      recentInterventions: [],
      onboardingCompleted: true,
      lastFindThreeVariantIndex: 2,
    };

    const updated = updateMemory(profile, "feet_on_ground", true, Date.UTC(2026, 0, 1, 12));

    expect(updated.onboardingCompleted).toBe(true);
    expect(updated.lastFindThreeVariantIndex).toBe(2);
  });
});
