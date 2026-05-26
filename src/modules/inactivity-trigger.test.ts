import {
  INACTIVITY_TRIGGER_MINUTES,
  getInactivityNotificationDelaySeconds,
  getInactivityTriggerThresholdMinutes,
  isPathBlockedForAutoTrigger,
  resolveInactiveMinutesForTrigger,
  shouldAutoOpenTrigger,
} from "./inactivity-trigger";

describe("inactivity trigger", () => {
  afterEach(() => {
    delete process.env.EXPO_PUBLIC_INACTIVITY_TRIGGER_MINUTES;
    delete process.env.EXPO_PUBLIC_SIMULATED_INACTIVE_MINUTES;
  });

  it("opens trigger after 20 inactive minutes", () => {
    expect(INACTIVITY_TRIGGER_MINUTES).toBe(20);
    expect(getInactivityTriggerThresholdMinutes()).toBe(20);
    expect(shouldAutoOpenTrigger(19)).toBe(false);
    expect(shouldAutoOpenTrigger(20)).toBe(true);
    expect(shouldAutoOpenTrigger(45)).toBe(true);
  });

  it("schedules notification delay from threshold minutes", () => {
    expect(getInactivityNotificationDelaySeconds(20)).toBe(1200);
    expect(getInactivityNotificationDelaySeconds(1)).toBe(60);
  });

  it("supports QA env overrides", () => {
    process.env.EXPO_PUBLIC_INACTIVITY_TRIGGER_MINUTES = "1";
    process.env.EXPO_PUBLIC_SIMULATED_INACTIVE_MINUTES = "25";
    expect(getInactivityTriggerThresholdMinutes()).toBe(1);
    expect(resolveInactiveMinutesForTrigger(0)).toBe(0);
    expect(resolveInactiveMinutesForTrigger(2)).toBe(25);
    expect(shouldAutoOpenTrigger(2)).toBe(true);
  });

  it("blocks auto trigger during action flow screens", () => {
    expect(isPathBlockedForAutoTrigger("/action")).toBe(true);
    expect(isPathBlockedForAutoTrigger("/explanation")).toBe(true);
    expect(isPathBlockedForAutoTrigger("/return")).toBe(true);
    expect(isPathBlockedForAutoTrigger("/trigger")).toBe(false);
    expect(isPathBlockedForAutoTrigger("/")).toBe(false);
  });
});
