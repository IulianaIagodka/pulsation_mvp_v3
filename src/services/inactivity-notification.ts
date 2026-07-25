import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { getAdaptiveTriggerThresholdMinutes, getInactivityNotificationDelaySeconds } from "../modules/inactivity-trigger";
import { uiCopy } from "../modules/delivery-layer";

export const INACTIVITY_NOTIFICATION_ID = "pulsation-inactivity-trigger";
const LEGACY_INACTIVITY_NOTIFICATION_SERIES_COUNT = 6;

function getInactivityNotificationIdentifier(index: number): string {
  return index === 0 ? INACTIVITY_NOTIFICATION_ID : `${INACTIVITY_NOTIFICATION_ID}-${index + 1}`;
}

export function getInactivityNotificationIdentifiers(): string[] {
  return [INACTIVITY_NOTIFICATION_ID];
}

function getLegacyInactivityNotificationIdentifiers(): string[] {
  return Array.from({ length: LEGACY_INACTIVITY_NOTIFICATION_SERIES_COUNT }, (_, index) =>
    getInactivityNotificationIdentifier(index),
  );
}

async function cancelScheduledInactivityNotifications(): Promise<void> {
  const identifiers = new Set([
    ...getInactivityNotificationIdentifiers(),
    ...getLegacyInactivityNotificationIdentifiers(),
  ]);
  for (const identifier of identifiers) {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }
}

export function configureInactivityNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function hasInactivityNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const current = await Notifications.getPermissionsAsync();
  return current.granted ?? false;
}

export async function requestInactivityNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  if (await hasInactivityNotificationPermission()) return true;

  const requested = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: false, allowSound: false },
  });
  return requested.granted ?? false;
}

async function ensurePermissions(): Promise<boolean> {
  return requestInactivityNotificationPermission();
}

export async function scheduleInactivityNotification(): Promise<void> {
  if (Platform.OS === "web") return;

  try {
    const granted = await ensurePermissions();
    if (!granted) return;

    await cancelScheduledInactivityNotifications();

    const thresholdMinutes = getAdaptiveTriggerThresholdMinutes();
    const delaySeconds = getInactivityNotificationDelaySeconds(thresholdMinutes);

    await Notifications.scheduleNotificationAsync({
      identifier: INACTIVITY_NOTIFICATION_ID,
      content: {
        title: uiCopy.inactivityNotificationTitle,
        body: uiCopy.inactivityNotificationBody,
        data: { route: "/trigger" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: delaySeconds,
        repeats: false,
      },
    });
  } catch (error) {
    console.warn("[inactivity-notification] schedule failed:", error);
  }
}

export async function cancelInactivityNotification(): Promise<void> {
  if (Platform.OS === "web") return;

  try {
    await cancelScheduledInactivityNotifications();
  } catch (error) {
    console.warn("[inactivity-notification] cancel failed:", error);
  }
}
