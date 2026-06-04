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
  recordAppStateChange,
} from "./session-runtime";

describe("session runtime inactivity", () => {
  afterEach(() => {
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

  it("does not report inactive minutes before first background", () => {
    recordAppStateChange("active");
    expect(consumeInactiveMinutesOnResume()).toBe(0);
  });

  it("restores inactive minutes from persisted background after a process restart", () => {
    const start = Date.now();
    jest.spyOn(Date, "now").mockReturnValue(start);
    (getSchedulingProfile as jest.Mock).mockReturnValue({
      lastBackgroundAt: start - 9 * 60 * 60 * 1000,
    });

    expect(consumeInactiveMinutesOnResume()).toBe(540);
    expect(clearAppBackgrounded).toHaveBeenCalled();
    (getSchedulingProfile as jest.Mock).mockReturnValue({});
    expect(consumeInactiveMinutesOnResume()).toBe(0);
  });

  it("persists background timestamp when leaving active", () => {
    recordAppStateChange("background");
    expect(recordAppBackgrounded).toHaveBeenCalled();
  });
});
