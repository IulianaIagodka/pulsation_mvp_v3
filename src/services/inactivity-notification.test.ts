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
  cancelInactivityNotification,
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

  it("schedules one adaptive background reminder that opens the trigger screen", async () => {
    await scheduleInactivityNotification();

    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledTimes(1);
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
      INACTIVITY_NOTIFICATION_ID,
    );
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
      identifier: INACTIVITY_NOTIFICATION_ID,
      content: {
        title: "One action for you now?",
        body: "A quiet invitation is waiting.",
        data: { route: "/trigger" },
      },
      trigger: {
        type: "timeInterval",
        seconds: 27 * 60,
        repeats: false,
      },
      });
  });

  it("cancels the pending inactivity reminder", async () => {
    await cancelInactivityNotification();

    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledTimes(1);
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
      INACTIVITY_NOTIFICATION_ID,
    );
  });
});
