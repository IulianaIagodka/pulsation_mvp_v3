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
  INACTIVITY_NOTIFICATION_FOLLOWUP_DAYS,
  INACTIVITY_NOTIFICATION_ID,
  INACTIVITY_NOTIFICATION_SERIES_COUNT,
  buildInactivityNotificationPlan,
  cancelInactivityNotification,
  getInactivityNotificationIdentifiers,
  scheduleInactivityNotification,
} from "./inactivity-notification";

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

  it("plans a near adaptive series plus multi-day follow-ups", () => {
    const gap = 20 * 60;
    const plan = buildInactivityNotificationPlan(gap);

    expect(plan).toHaveLength(
      INACTIVITY_NOTIFICATION_SERIES_COUNT + INACTIVITY_NOTIFICATION_FOLLOWUP_DAYS,
    );
    expect(plan.filter((item) => item.kind === "near")).toHaveLength(
      INACTIVITY_NOTIFICATION_SERIES_COUNT,
    );
    expect(plan.filter((item) => item.kind === "followup")).toHaveLength(
      INACTIVITY_NOTIFICATION_FOLLOWUP_DAYS,
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
      delaySeconds: gap + 24 * 60 * 60,
      kind: "followup",
    });
    expect(plan[plan.length - 1]).toMatchObject({
      identifier: `${INACTIVITY_NOTIFICATION_ID}-day-7`,
      delaySeconds: gap + 7 * 24 * 60 * 60,
      kind: "followup",
    });
  });

  it("lists stable identifiers for near series and daily follow-ups", () => {
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
    ]);
  });

  it("schedules near reminders and multi-day follow-ups that open the trigger screen", async () => {
    await scheduleInactivityNotification();

    const plan = buildInactivityNotificationPlan(27 * 60);
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
  });

  it("cancels owned pending reminders discovered from the OS queue", async () => {
    (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([
      { identifier: INACTIVITY_NOTIFICATION_ID },
      { identifier: `${INACTIVITY_NOTIFICATION_ID}-3` },
      { identifier: `${INACTIVITY_NOTIFICATION_ID}-day-2` },
      { identifier: "other-app-notification" },
    ]);

    await cancelInactivityNotification();

    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledTimes(3);
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
      INACTIVITY_NOTIFICATION_ID,
    );
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
      `${INACTIVITY_NOTIFICATION_ID}-3`,
    );
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
      `${INACTIVITY_NOTIFICATION_ID}-day-2`,
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
