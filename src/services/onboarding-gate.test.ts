import { getOutcomesProfile, saveOutcomesProfile } from "../data/repositories/outcomes-repo";
import { hasCompletedOnboarding, markOnboardingCompleted } from "./onboarding-gate";

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
      recentInterventions: [],
    });
  });

  it("returns false until onboarding is marked complete", () => {
    expect(hasCompletedOnboarding()).toBe(false);
  });

  it("returns true after markOnboardingCompleted", () => {
    (getOutcomesProfile as jest.Mock).mockReturnValue({
      preferredByHour: {},
      completionRates: {},
      recentInterventions: [],
      onboardingCompleted: true,
    });
    expect(hasCompletedOnboarding()).toBe(true);
  });

  it("persists onboardingCompleted on mark", () => {
    markOnboardingCompleted();
    expect(saveOutcomesProfile).toHaveBeenCalledWith(
      expect.objectContaining({ onboardingCompleted: true }),
    );
  });
});
