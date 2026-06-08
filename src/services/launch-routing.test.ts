import { clearAppBackgrounded, getSchedulingProfile } from "../data/repositories/scheduling-profile-repo";
import { __sessionRuntimeInternals, isWarmProcessResume, recordAppStateChange } from "../modules/session-runtime";
import { hasCompletedExtendedOnboarding } from "./onboarding-gate";
import {
  clearLaunchOnboardingBackgroundFlag,
  isLaunchOnboardingPath,
  resolveLaunchOnboardingKind,
  shouldLeaveLaunchOnboardingOnResume,
  shouldSkipLaunchOnboarding,
} from "./launch-routing";

jest.mock("../data/repositories/scheduling-profile-repo", () => ({
  getSchedulingProfile: jest.fn(),
  clearAppBackgrounded: jest.fn(),
  recordAppBackgrounded: jest.fn(),
}));

jest.mock("./pulsation-flow", () => ({
  bootstrapPulsation: jest.fn(),
}));

jest.mock("./onboarding-gate", () => ({
  hasCompletedExtendedOnboarding: jest.fn(),
}));

describe("launch-routing", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    __sessionRuntimeInternals.resetForTests();
    (getSchedulingProfile as jest.Mock).mockReturnValue({
      consecutiveIgnored: 0,
      totalCompleted: 0,
      completionsByType: {},
      completionsByHour: {},
    });
  });

  it("shows full onboarding on first install cold start", () => {
    (hasCompletedExtendedOnboarding as jest.Mock).mockReturnValue(false);
    expect(resolveLaunchOnboardingKind()).toBe("extended");
  });

  it("shows short onboarding on later cold starts", () => {
    (hasCompletedExtendedOnboarding as jest.Mock).mockReturnValue(true);
    expect(resolveLaunchOnboardingKind()).toBe("short");
  });

  it("shows short onboarding on cold start even after persisted background", () => {
    (hasCompletedExtendedOnboarding as jest.Mock).mockReturnValue(true);
    (getSchedulingProfile as jest.Mock).mockReturnValue({
      consecutiveIgnored: 0,
      totalCompleted: 0,
      completionsByType: {},
      completionsByHour: {},
      lastBackgroundAt: Date.now() - 60_000,
    });
    expect(resolveLaunchOnboardingKind()).toBe("short");
  });

  it("shows launch onboarding on a cold start", () => {
    (hasCompletedExtendedOnboarding as jest.Mock).mockReturnValue(true);
    expect(shouldSkipLaunchOnboarding()).toBe(false);
  });

  it("skips launch onboarding on warm resume in the same process", () => {
    recordAppStateChange("background");
    expect(shouldSkipLaunchOnboarding()).toBe(true);
    expect(resolveLaunchOnboardingKind()).toBe("skip");
  });

  it("leaves launch onboarding on resume from background", () => {
    recordAppStateChange("background");
    expect(shouldLeaveLaunchOnboardingOnResume("/", isWarmProcessResume())).toBe(true);
    expect(shouldLeaveLaunchOnboardingOnResume("/trigger", isWarmProcessResume())).toBe(false);
    expect(shouldLeaveLaunchOnboardingOnResume("/", false)).toBe(false);
  });

  it("recognizes launch onboarding paths", () => {
    expect(isLaunchOnboardingPath("/")).toBe(true);
    expect(isLaunchOnboardingPath("/index")).toBe(true);
    expect(isLaunchOnboardingPath("/trigger")).toBe(false);
  });

  it("clears persisted background flag when skipping launch onboarding", () => {
    clearLaunchOnboardingBackgroundFlag();
    expect(clearAppBackgrounded).toHaveBeenCalled();
  });
});
