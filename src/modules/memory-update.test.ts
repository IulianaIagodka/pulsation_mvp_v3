import { updateMemory } from "./memory-update";

describe("updateMemory", () => {
  it("keeps onboarding flags and find-three variant index", () => {
    const profile = {
      preferredByHour: {},
      completionRates: {},
      recentInterventions: [],
      onboardingCompleted: true,
      extendedOnboardingCompleted: true,
      lastFindThreeVariantIndex: 2,
      preferenceScores: { feet_on_ground: 4 },
    };

    const updated = updateMemory(profile, "feet_on_ground", true, Date.UTC(2026, 0, 1, 12));

    expect(updated.onboardingCompleted).toBe(true);
    expect(updated.extendedOnboardingCompleted).toBe(true);
    expect(updated.lastFindThreeVariantIndex).toBe(2);
    expect(updated.preferenceScores.feet_on_ground).toBe(4);
  });
});
