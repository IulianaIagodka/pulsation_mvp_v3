import { getOutcomesProfile, saveOutcomesProfile } from "../data/repositories/outcomes-repo";
import {
  hasCompletedExtendedOnboarding,
  hasCompletedOnboarding,
  markExtendedOnboardingCompleted,
  markOnboardingCompleted,
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

  it("persists extendedOnboardingCompleted on mark", () => {
    markExtendedOnboardingCompleted();
    expect(saveOutcomesProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        extendedOnboardingCompleted: true,
        onboardingCompleted: true,
      }),
    );
  });

  it("returns false until onboarding is marked complete", () => {
    expect(hasCompletedOnboarding()).toBe(false);
  });

  it("returns true after markOnboardingCompleted", () => {
    (getOutcomesProfile as jest.Mock).mockReturnValue({
      preferredByHour: {},
      completionRates: {},
      preferenceScores: {},
      recentInterventions: [],
      onboardingCompleted: true,
    });
    expect(hasCompletedOnboarding()).toBe(true);
  });

  it("persists extendedOnboardingCompleted when legacy onboarding is marked", () => {
    markOnboardingCompleted();
    expect(saveOutcomesProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        extendedOnboardingCompleted: true,
        onboardingCompleted: true,
      }),
    );
  });
});
