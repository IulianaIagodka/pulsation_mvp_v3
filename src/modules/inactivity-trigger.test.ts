jest.mock("../data/repositories/scheduling-profile-repo", () => ({
  getSchedulingProfile: () => ({
    consecutiveIgnored: 0,
    totalCompleted: 0,
    completionsByType: {},
    completionsByHour: {},
  }),
  recordScheduledInterval: jest.fn(),
  recordAppOpen: jest.fn(),
}));

jest.mock("../data/repositories/safety-repo", () => ({
  getSafetyState: () => ({
    quietHoursStart: 0,
    quietHoursEnd: 0,
    dailyCap: 4,
    cooldownMinutes: 45,
    interventionsToday: 0,
    dismissalStreak: 0,
  }),
}));

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

  it("uses env override for fixed QA thresholds", () => {
    process.env.EXPO_PUBLIC_INACTIVITY_TRIGGER_MINUTES = "20";
    expect(getInactivityTriggerThresholdMinutes()).toBe(20);
    expect(shouldAutoOpenTrigger(19)).toBe(false);
    expect(shouldAutoOpenTrigger(20)).toBe(true);
    expect(shouldAutoOpenTrigger(45)).toBe(true);
  });

  it("falls back to base minutes when adaptive scheduling is unavailable", () => {
    expect(INACTIVITY_TRIGGER_MINUTES).toBe(20);
  });

  it("schedules notification delay from threshold minutes", () => {
    expect(getInactivityNotificationDelaySeconds(20)).toBe(1200);
    expect(getInactivityNotificationDelaySeconds(1)).toBe(60);
  });

  it("supports QA env overrides for simulated inactivity", () => {
    process.env.EXPO_PUBLIC_INACTIVITY_TRIGGER_MINUTES = "1";
    process.env.EXPO_PUBLIC_SIMULATED_INACTIVE_MINUTES = "25";
    expect(getInactivityTriggerThresholdMinutes()).toBe(1);
    expect(resolveInactiveMinutesForTrigger(0)).toBe(0);
    expect(resolveInactiveMinutesForTrigger(2)).toBe(25);
    expect(shouldAutoOpenTrigger(2)).toBe(true);
  });

  it("blocks auto trigger during action flow screens for short resumes", () => {
    expect(isPathBlockedForAutoTrigger("/action", 0)).toBe(true);
    expect(isPathBlockedForAutoTrigger("/return", 0)).toBe(true);
    expect(isPathBlockedForAutoTrigger("/trigger", 0)).toBe(false);
    expect(isPathBlockedForAutoTrigger("/")).toBe(false);
  });

  it("allows auto trigger on flow screens after the inactivity threshold", () => {
    process.env.EXPO_PUBLIC_INACTIVITY_TRIGGER_MINUTES = "20";
    expect(isPathBlockedForAutoTrigger("/return", 20)).toBe(false);
    expect(isPathBlockedForAutoTrigger("/action", 45)).toBe(false);
  });
});
