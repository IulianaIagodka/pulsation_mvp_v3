jest.mock("../data/repositories/scheduling-profile-repo", () => ({
  getSchedulingProfile: jest.fn(() => ({})),
  recordAppBackgrounded: jest.fn(),
  clearAppBackgrounded: jest.fn(),
}));

import { collectSignal } from "./signal-collector";
import { __sessionRuntimeInternals } from "./session-runtime";

describe("collectSignal", () => {
  afterEach(() => {
    delete process.env.EXPO_PUBLIC_SIMULATED_DISTRACT_MINUTES;
    delete process.env.EXPO_PUBLIC_SIMULATED_APP_CATEGORY;
    __sessionRuntimeInternals.resetForTests();
  });

  it("uses configured values from env", () => {
    process.env.EXPO_PUBLIC_SIMULATED_DISTRACT_MINUTES = "42";
    process.env.EXPO_PUBLIC_SIMULATED_APP_CATEGORY = "video";

    const signal = collectSignal();
    expect(signal.distractingSessionMinutes).toBe(42);
    expect(signal.appCategory).toBe("video");
  });

  it("falls back to safe defaults when env is invalid", () => {
    process.env.EXPO_PUBLIC_SIMULATED_DISTRACT_MINUTES = "invalid";
    process.env.EXPO_PUBLIC_SIMULATED_APP_CATEGORY = "games";

    const signal = collectSignal();
    expect(signal.distractingSessionMinutes).toBeGreaterThanOrEqual(20);
    expect(signal.appCategory).toBe("other");
  });

  it("does not treat unset env as 0 minutes (empty string must not override)", () => {
    process.env.EXPO_PUBLIC_SIMULATED_DISTRACT_MINUTES = "";

    const signal = collectSignal();
    expect(signal.distractingSessionMinutes).toBeGreaterThanOrEqual(20);
  });

  it("uses runtime fallback when env var is absent", () => {
    const signal = collectSignal();
    expect(signal.distractingSessionMinutes).toBeGreaterThanOrEqual(20);
  });

  it("uses pending inactive minutes from a background resume", () => {
    __sessionRuntimeInternals.setPendingInactiveMinutes(30);
    const signal = collectSignal();
    expect(signal.distractingSessionMinutes).toBe(30);
  });
});
