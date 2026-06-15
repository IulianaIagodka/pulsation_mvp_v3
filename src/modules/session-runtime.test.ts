jest.mock("../data/repositories/scheduling-profile-repo", () => ({
  getSchedulingProfile: jest.fn(() => ({})),
  recordAppBackgrounded: jest.fn(),
  clearAppBackgrounded: jest.fn(),
}));

import {
  clearAppBackgrounded,
  getSchedulingProfile,
  recordAppBackgrounded,
} from "../data/repositories/scheduling-profile-repo";
import {
  __sessionRuntimeInternals,
  consumeInactiveMinutesOnResume,
  consumeResumeSessionOnForeground,
  getResumeSessionSnapshot,
  recordAppStateChange,
} from "./session-runtime";

describe("session runtime inactivity", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    __sessionRuntimeInternals.resetForTests();
    jest.clearAllMocks();
    (getSchedulingProfile as jest.Mock).mockReturnValue({});
  });

  it("returns inactive minutes after background resume", () => {
    const start = Date.now();
    jest.spyOn(Date, "now").mockReturnValue(start);

    recordAppStateChange("background");
    jest.spyOn(Date, "now").mockReturnValue(start + 25 * 60 * 1000);
    recordAppStateChange("active");

    expect(consumeInactiveMinutesOnResume()).toBe(25);
    expect(consumeInactiveMinutesOnResume()).toBe(0);
  });

  it("exposes a warm resume snapshot before it is consumed", () => {
    const start = Date.now();
    jest.spyOn(Date, "now").mockReturnValue(start);

    recordAppStateChange("background");
    jest.spyOn(Date, "now").mockReturnValue(start + 21 * 60 * 1000);
    recordAppStateChange("active");

    expect(getResumeSessionSnapshot()).toEqual({
      kind: "warm",
      inactiveMinutes: 21,
      warmResume: true,
      coldStartAfterBackground: false,
    });
    expect(consumeResumeSessionOnForeground()).toEqual({
      kind: "warm",
      inactiveMinutes: 21,
      warmResume: true,
      coldStartAfterBackground: false,
    });
    expect(getResumeSessionSnapshot()).toEqual({
      kind: "none",
      inactiveMinutes: 0,
      warmResume: false,
      coldStartAfterBackground: false,
    });
  });

  it("does not report inactive minutes before first background", () => {
    recordAppStateChange("active");
    expect(consumeInactiveMinutesOnResume()).toBe(0);
  });

  it("reports persisted background as a cold-start snapshot after a process restart", () => {
    const start = Date.now();
    jest.spyOn(Date, "now").mockReturnValue(start);
    (getSchedulingProfile as jest.Mock).mockReturnValue({
      lastBackgroundAt: start - 9 * 60 * 60 * 1000,
    });

    expect(consumeResumeSessionOnForeground()).toEqual({
      kind: "cold-start",
      inactiveMinutes: 540,
      warmResume: false,
      coldStartAfterBackground: true,
    });
    expect(clearAppBackgrounded).toHaveBeenCalled();
    (getSchedulingProfile as jest.Mock).mockReturnValue({});
    expect(consumeInactiveMinutesOnResume()).toBe(0);
  });

  it("clears persisted cold-start background even when the clock moved backwards", () => {
    const start = Date.now();
    jest.spyOn(Date, "now").mockReturnValue(start);
    (getSchedulingProfile as jest.Mock).mockReturnValue({
      lastBackgroundAt: start + 60 * 60 * 1000,
    });

    expect(consumeResumeSessionOnForeground()).toEqual({
      kind: "cold-start",
      inactiveMinutes: 0,
      warmResume: false,
      coldStartAfterBackground: true,
    });
    expect(clearAppBackgrounded).toHaveBeenCalled();
  });

  it("persists background timestamp when leaving active", () => {
    recordAppStateChange("background");
    expect(recordAppBackgrounded).toHaveBeenCalled();
  });
});
