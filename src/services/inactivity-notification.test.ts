jest.mock("react-native", () => ({
  Platform: { OS: "ios" },
}));

jest.mock("expo-notifications", () => ({
  SchedulableTriggerInputTypes: {
    TIME_INTERVAL: "timeInterval",
  },
  cancelScheduledNotificationAsync: jest.fn(),
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
  INACTIVITY_NOTIFICATION_ID,
  INACTIVITY_NOTIFICATION_SERIES_COUNT,
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
  });

  it("uses stable identifiers for the adaptive background reminder series", () => {
    expect(getInactivityNotificationIdentifiers()).toEqual([
      INACTIVITY_NOTIFICATION_ID,
      `${INACTIVITY_NOTIFICATION_ID}-2`,
      `${INACTIVITY_NOTIFICATION_ID}-3`,
      `${INACTIVITY_NOTIFICATION_ID}-4`,
      `${INACTIVITY_NOTIFICATION_ID}-5`,
      `${INACTIVITY_NOTIFICATION_ID}-6`,
    ]);
  });

  it("schedules adaptive background reminders that open the trigger screen", async () => {
    await scheduleInactivityNotification();

    const identifiers = getInactivityNotificationIdentifiers();
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledTimes(
      INACTIVITY_NOTIFICATION_SERIES_COUNT,
    );
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenNthCalledWith(
      1,
      INACTIVITY_NOTIFICATION_ID,
    );
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(
      INACTIVITY_NOTIFICATION_SERIES_COUNT,
    );

    identifiers.forEach((identifier, index) => {
      expect(Notifications.scheduleNotificationAsync).toHaveBeenNthCalledWith(index + 1, {
        identifier,
        content: {
          title: "One action for you now?",
          body: "A quiet invitation is waiting.",
          data: { route: "/trigger" },
        },
        trigger: {
          type: "timeInterval",
          seconds: 27 * 60 * (index + 1),
          repeats: false,
        },
      });
    });
  });

  it("cancels every pending inactivity reminder", async () => {
    await cancelInactivityNotification();

    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledTimes(
      INACTIVITY_NOTIFICATION_SERIES_COUNT,
    );
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenLastCalledWith(
      `${INACTIVITY_NOTIFICATION_ID}-6`,
    );
  });
});
