import {
  BASE_INTERVAL_MINUTES,
  MAX_INTERVAL_MINUTES,
  computeAdaptiveIntervalMinutes,
  explainInterval,
} from "./adaptive-scheduler";
import { SafetyState, SchedulingProfile } from "../types/domain";

const baseSafety: SafetyState = {
  quietHoursStart: 0,
  quietHoursEnd: 0,
  dailyCap: 4,
  cooldownMinutes: 45,
  interventionsToday: 0,
  dismissalStreak: 0,
};

const emptyProfile: SchedulingProfile = {
  consecutiveIgnored: 0,
  totalCompleted: 0,
  completionsByType: {},
  completionsByHour: {},
};

const fixedRandom = () => 0.5;

describe("computeAdaptiveIntervalMinutes", () => {
  const now = Date.UTC(2026, 4, 30, 12, 0, 0);

  it("starts near base interval for a new user", () => {
    const { minutes } = computeAdaptiveIntervalMinutes(emptyProfile, baseSafety, now, fixedRandom);
    expect(minutes).toBeGreaterThanOrEqual(BASE_INTERVAL_MINUTES);
    expect(minutes).toBeLessThanOrEqual(35);
  });

  it("extends interval after a recent completion", () => {
    const profile: SchedulingProfile = {
      ...emptyProfile,
      lastCompletedAt: now - 30 * 60_000,
    };
    const { minutes } = computeAdaptiveIntervalMinutes(profile, baseSafety, now, fixedRandom);
    expect(minutes).toBeGreaterThan(40);
  });

  it("extends interval when several Pulsations were completed today", () => {
    const safety = { ...baseSafety, interventionsToday: 3 };
    const { minutes } = computeAdaptiveIntervalMinutes(emptyProfile, safety, now, fixedRandom);
    expect(minutes).toBeGreaterThan(50);
  });

  it("extends interval for consecutive ignored Pulsations", () => {
    const profile = { ...emptyProfile, consecutiveIgnored: 3 };
    const { minutes } = computeAdaptiveIntervalMinutes(profile, baseSafety, now, fixedRandom);
    expect(minutes).toBeGreaterThan(55);
  });

  it("becomes less intrusive after several days away", () => {
    const profile: SchedulingProfile = {
      ...emptyProfile,
      lastAppOpenAt: now - 5 * 86_400_000,
    };
    const { minutes } = computeAdaptiveIntervalMinutes(profile, baseSafety, now, fixedRandom);
    expect(minutes).toBeGreaterThan(70);
  });

  it("gradually restores frequency after the user returns from a break", () => {
    const fiveDaysAgo = now - 5 * 86_400_000;
    const stillAway: SchedulingProfile = {
      ...emptyProfile,
      lastAppOpenAt: fiveDaysAgo,
      lastCompletedAt: fiveDaysAgo,
    };
    const away = computeAdaptiveIntervalMinutes(stillAway, baseSafety, now, fixedRandom).minutes;

    const freshReturn: SchedulingProfile = {
      ...emptyProfile,
      lastAppOpenAt: now - 2 * 60 * 60_000,
      lastCompletedAt: fiveDaysAgo,
    };
    const returning = computeAdaptiveIntervalMinutes(freshReturn, baseSafety, now, fixedRandom).minutes;
    expect(returning).toBeLessThan(away);
  });

  it("avoids repeating the exact previous interval", () => {
    const profile: SchedulingProfile = {
      ...emptyProfile,
      lastScheduledIntervalMinutes: 42,
    };
    const { minutes } = computeAdaptiveIntervalMinutes(profile, baseSafety, now, fixedRandom);
    expect(Math.abs(minutes - 42)).toBeGreaterThanOrEqual(4);
  });

  it("never exceeds the maximum interval", () => {
    const profile: SchedulingProfile = {
      ...emptyProfile,
      consecutiveIgnored: 10,
      lastCompletedAt: now - 5 * 60_000,
      lastAppOpenAt: now - 14 * 86_400_000,
    };
    const safety = { ...baseSafety, interventionsToday: 4 };
    const { minutes } = computeAdaptiveIntervalMinutes(profile, safety, now, fixedRandom);
    expect(minutes).toBeLessThanOrEqual(MAX_INTERVAL_MINUTES);
  });

  it("produces a human-readable explanation", () => {
    const profile: SchedulingProfile = {
      ...emptyProfile,
      lastCompletedAt: now - 20 * 60_000,
      consecutiveIgnored: 1,
    };
    const { factors } = computeAdaptiveIntervalMinutes(profile, baseSafety, now, fixedRandom);
    const explanation = explainInterval(factors);
    expect(explanation).toContain("recent completion");
    expect(explanation).toContain("ignored streak");
    expect(explanation).toContain(`→ ${factors.finalMinutes}m`);
  });
});
