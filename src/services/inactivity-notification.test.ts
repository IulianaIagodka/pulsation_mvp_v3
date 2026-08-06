jest.mock("react-native", () => ({
  Platform: { OS: "ios" },
}));

jest.mock("expo-notifications", () => ({
  SchedulableTriggerInputTypes: {
    TIME_INTERVAL: "timeInterval",
  },
  cancelScheduledNotificationAsync: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
}));

jest.mock("../modules/inactivity-trigger", () => ({
  getAdaptiveTriggerThresholdMinutes: jest.fn(() => 27),
  getInactivityNotificationDelaySeconds: jest.fn((minutes?: number) => (minutes ?? 20) * 60),
}));

jest.mock("../modules/delivery-layer", () => ({
  uiCopy: {
    inactivityNotificationTitle: "One action for you now?",
    inactivityNotificationBody: "A quiet invitation is waiting.",
  },
}));

import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import {
  INACTIVITY_FOLLOWUP_DAYTIME_END_HOUR,
  INACTIVITY_FOLLOWUP_DAYTIME_START_HOUR,
  INACTIVITY_NOTIFICATION_FOLLOWUP_DAYS,
  INACTIVITY_NOTIFICATION_ID,
  INACTIVITY_NOTIFICATION_SERIES_COUNT,
  INACTIVITY_NOTIFICATION_WEEKLY_FOLLOWUPS,
  INACTIVITY_QUIET_HOURS_END,
  INACTIVITY_QUIET_HOURS_START,
  buildInactivityNotificationPlan,
  cancelInactivityNotification,
  getInactivityNotificationIdentifiers,
  isInQuietHours,
  scheduleInactivityNotification,
  snapFollowupToDaytimeWindow,
  snapOutOfQuietHours,
} from "./inactivity-notification";

/** Midday local time so raw follow-ups stay inside the daytime window. */
const MIDDAY_NOW = new Date(2026, 7, 5, 14, 0, 0).getTime();

describe("inactivity notifications", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Platform as { OS: string }).OS = "ios";
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
    (Notifications.cancelScheduledNotificationAsync as jest.Mock).mockResolvedValue(undefined);
    (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue("scheduled");
    (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([]);
  });

  it("plans near series, daily week, then weekly follow-ups", () => {
    const gap = 20 * 60;
    const day = 24 * 60 * 60;
    const plan = buildInactivityNotificationPlan(gap, MIDDAY_NOW);

    expect(plan).toHaveLength(
      INACTIVITY_NOTIFICATION_SERIES_COUNT +
        INACTIVITY_NOTIFICATION_FOLLOWUP_DAYS +
        INACTIVITY_NOTIFICATION_WEEKLY_FOLLOWUPS,
    );
    expect(plan.filter((item) => item.kind === "near")).toHaveLength(
      INACTIVITY_NOTIFICATION_SERIES_COUNT,
    );
    expect(plan.filter((item) => item.kind === "daily")).toHaveLength(
      INACTIVITY_NOTIFICATION_FOLLOWUP_DAYS,
    );
    expect(plan.filter((item) => item.kind === "weekly")).toHaveLength(
      INACTIVITY_NOTIFICATION_WEEKLY_FOLLOWUPS,
    );

    expect(plan[0]).toMatchObject({
      identifier: INACTIVITY_NOTIFICATION_ID,
      delaySeconds: gap,
      kind: "near",
    });
    expect(plan[5]).toMatchObject({
      identifier: `${INACTIVITY_NOTIFICATION_ID}-6`,
      delaySeconds: gap * 6,
      kind: "near",
    });
    expect(plan[6]).toMatchObject({
      identifier: `${INACTIVITY_NOTIFICATION_ID}-day-1`,
      delaySeconds: gap + day,
      kind: "daily",
    });
    expect(plan[12]).toMatchObject({
      identifier: `${INACTIVITY_NOTIFICATION_ID}-day-7`,
      delaySeconds: gap + 7 * day,
      kind: "daily",
    });
    expect(plan[13]).toMatchObject({
      identifier: `${INACTIVITY_NOTIFICATION_ID}-week-1`,
      delaySeconds: gap + 14 * day,
      kind: "weekly",
    });
    expect(plan[plan.length - 1]).toMatchObject({
      identifier: `${INACTIVITY_NOTIFICATION_ID}-week-8`,
      delaySeconds: gap + 63 * day,
      kind: "weekly",
    });
  });

  it("snaps late-evening follow-ups into the next morning daytime window", () => {
    const gap = 20 * 60;
    const eveningNow = new Date(2026, 7, 5, 22, 15, 0).getTime();
    const plan = buildInactivityNotificationPlan(gap, eveningNow);
    const day1 = plan.find((item) => item.identifier === `${INACTIVITY_NOTIFICATION_ID}-day-1`);
    expect(day1).toBeDefined();

    const fireAt = new Date(eveningNow + day1!.delaySeconds * 1000);
    expect(fireAt.getHours()).toBeGreaterThanOrEqual(INACTIVITY_FOLLOWUP_DAYTIME_START_HOUR);
    expect(fireAt.getHours()).toBeLessThan(INACTIVITY_FOLLOWUP_DAYTIME_END_HOUR);
    // Same calendar day as the raw +24h target (Aug 6), not deferred to Aug 7.
    expect(fireAt.getFullYear()).toBe(2026);
    expect(fireAt.getMonth()).toBe(7);
    expect(fireAt.getDate()).toBe(6);
    // Must arrive well before evening — the bug was a whole silent day until after 22.
    expect(fireAt.getHours()).toBeLessThan(18);
  });

  it("never schedules invitations during overnight quiet hours", () => {
    const gap = 20 * 60;
    const lateNow = new Date(2026, 7, 5, 23, 10, 0).getTime();
    const plan = buildInactivityNotificationPlan(gap, lateNow);

    for (const item of plan) {
      const fireAt = new Date(lateNow + item.delaySeconds * 1000);
      expect(isInQuietHours(fireAt)).toBe(false);
      expect(
        fireAt.getHours() >= INACTIVITY_QUIET_HOURS_START ||
          fireAt.getHours() < INACTIVITY_QUIET_HOURS_END,
      ).toBe(false);
    }

    const nearTimes = plan
      .filter((item) => item.kind === "near")
      .map((item) => lateNow + item.delaySeconds * 1000);
    // Near series that would have fired overnight is pushed to morning and destaggered.
    expect(new Date(nearTimes[0]).getHours()).toBeGreaterThanOrEqual(INACTIVITY_QUIET_HOURS_END);
    expect(nearTimes[1] - nearTimes[0]).toBeGreaterThanOrEqual(gap * 1000);
  });

  it("snaps a quiet-hour timestamp to 07:00 local", () => {
    const target = new Date(2026, 7, 6, 1, 20, 0).getTime();
    const earliest = new Date(2026, 7, 5, 23, 0, 0).getTime();
    const snapped = new Date(snapOutOfQuietHours(target, earliest));
    expect(snapped.getHours()).toBe(INACTIVITY_QUIET_HOURS_END);
    expect(snapped.getMinutes()).toBe(20);
    expect(snapped.getDate()).toBe(6);
  });

  it("keeps midday follow-ups on their natural clock time", () => {
    const target = new Date(2026, 7, 6, 14, 20, 0).getTime();
    const earliest = new Date(2026, 7, 5, 15, 0, 0).getTime();
    expect(snapFollowupToDaytimeWindow(target, earliest)).toBe(target);
  });

  it("moves pre-morning targets up to the daytime start hour", () => {
    const target = new Date(2026, 7, 6, 7, 5, 0).getTime();
    const earliest = new Date(2026, 7, 5, 12, 0, 0).getTime();
    const snapped = new Date(snapFollowupToDaytimeWindow(target, earliest));
    expect(snapped.getFullYear()).toBe(2026);
    expect(snapped.getMonth()).toBe(7);
    expect(snapped.getDate()).toBe(6);
    expect(snapped.getHours()).toBe(INACTIVITY_FOLLOWUP_DAYTIME_START_HOUR);
    expect(snapped.getMinutes()).toBe(5);
  });

  it("lists stable identifiers for near, daily, and weekly reminders", () => {
    expect(getInactivityNotificationIdentifiers()).toEqual([
      INACTIVITY_NOTIFICATION_ID,
      `${INACTIVITY_NOTIFICATION_ID}-2`,
      `${INACTIVITY_NOTIFICATION_ID}-3`,
      `${INACTIVITY_NOTIFICATION_ID}-4`,
      `${INACTIVITY_NOTIFICATION_ID}-5`,
      `${INACTIVITY_NOTIFICATION_ID}-6`,
      `${INACTIVITY_NOTIFICATION_ID}-day-1`,
      `${INACTIVITY_NOTIFICATION_ID}-day-2`,
      `${INACTIVITY_NOTIFICATION_ID}-day-3`,
      `${INACTIVITY_NOTIFICATION_ID}-day-4`,
      `${INACTIVITY_NOTIFICATION_ID}-day-5`,
      `${INACTIVITY_NOTIFICATION_ID}-day-6`,
      `${INACTIVITY_NOTIFICATION_ID}-day-7`,
      `${INACTIVITY_NOTIFICATION_ID}-week-1`,
      `${INACTIVITY_NOTIFICATION_ID}-week-2`,
      `${INACTIVITY_NOTIFICATION_ID}-week-3`,
      `${INACTIVITY_NOTIFICATION_ID}-week-4`,
      `${INACTIVITY_NOTIFICATION_ID}-week-5`,
      `${INACTIVITY_NOTIFICATION_ID}-week-6`,
      `${INACTIVITY_NOTIFICATION_ID}-week-7`,
      `${INACTIVITY_NOTIFICATION_ID}-week-8`,
    ]);
  });

  it("schedules the full invitation plan that opens the trigger screen", async () => {
    jest.spyOn(Date, "now").mockReturnValue(MIDDAY_NOW);

    await scheduleInactivityNotification();

    const plan = buildInactivityNotificationPlan(27 * 60, MIDDAY_NOW);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(plan.length);

    plan.forEach((item, index) => {
      expect(Notifications.scheduleNotificationAsync).toHaveBeenNthCalledWith(index + 1, {
        identifier: item.identifier,
        content: {
          title: "One action for you now?",
          body: "A quiet invitation is waiting.",
          data: { route: "/trigger" },
        },
        trigger: {
          type: "timeInterval",
          seconds: item.delaySeconds,
          repeats: false,
        },
      });
    });

    (Date.now as jest.Mock).mockRestore();
  });

  it("cancels owned pending reminders discovered from the OS queue", async () => {
    (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([
      { identifier: INACTIVITY_NOTIFICATION_ID },
      { identifier: `${INACTIVITY_NOTIFICATION_ID}-3` },
      { identifier: `${INACTIVITY_NOTIFICATION_ID}-day-2` },
      { identifier: `${INACTIVITY_NOTIFICATION_ID}-week-1` },
      { identifier: "other-app-notification" },
    ]);

    await cancelInactivityNotification();

    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledTimes(4);
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
      INACTIVITY_NOTIFICATION_ID,
    );
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
      `${INACTIVITY_NOTIFICATION_ID}-week-1`,
    );
    expect(Notifications.cancelScheduledNotificationAsync).not.toHaveBeenCalledWith(
      "other-app-notification",
    );
  });

  it("falls back to known identifiers when the OS queue cannot be listed", async () => {
    (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockRejectedValue(
      new Error("unavailable"),
    );

    await cancelInactivityNotification();

    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledTimes(
      getInactivityNotificationIdentifiers().length,
    );
  });
});
