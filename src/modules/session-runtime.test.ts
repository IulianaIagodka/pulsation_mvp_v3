import {
  __sessionRuntimeInternals,
  consumeInactiveMinutesOnResume,
  recordAppStateChange,
} from "./session-runtime";

describe("session runtime inactivity", () => {
  afterEach(() => {
    __sessionRuntimeInternals.resetForTests();
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
});
