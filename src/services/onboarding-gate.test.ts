import { getOutcomesProfile, saveOutcomesProfile } from "../data/repositories/outcomes-repo";
import {
  hasCompletedExtendedOnboarding,
  markExtendedOnboardingCompleted,
} from "./onboarding-gate";

jest.mock("../data/repositories/outcomes-repo", () => ({
  getOutcomesProfile: jest.fn(),
  saveOutcomesProfile: jest.fn(),
}));

jest.mock("./pulsation-flow", () => ({
  bootstrapPulsation: jest.fn(),
}));

describe("onboarding-gate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getOutcomesProfile as jest.Mock).mockReturnValue({
      preferredByHour: {},
      completionRates: {},
      preferenceScores: {},
      recentInterventions: [],
    });
  });

  it("returns false until extended onboarding is marked complete", () => {
    expect(hasCompletedExtendedOnboarding()).toBe(false);
  });

  it("returns true after markExtendedOnboardingCompleted", () => {
    (getOutcomesProfile as jest.Mock).mockReturnValue({
      preferredByHour: {},
      completionRates: {},
      preferenceScores: {},
      recentInterventions: [],
      extendedOnboardingCompleted: true,
    });
    expect(hasCompletedExtendedOnboarding()).toBe(true);
  });

  it("returns true when legacy onboardingCompleted is set without extended flag", () => {
    (getOutcomesProfile as jest.Mock).mockReturnValue({
      preferredByHour: {},
      completionRates: {},
      preferenceScores: {},
      recentInterventions: [],
      onboardingCompleted: true,
      extendedOnboardingCompleted: false,
    });
    expect(hasCompletedExtendedOnboarding()).toBe(true);
  });

  it("persists extendedOnboardingCompleted on mark", () => {
    markExtendedOnboardingCompleted();
    expect(saveOutcomesProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        extendedOnboardingCompleted: true,
        onboardingCompleted: true,
      }),
    );
  });

});
