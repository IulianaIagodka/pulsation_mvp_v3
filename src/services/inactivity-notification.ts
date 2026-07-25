import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { getAdaptiveTriggerThresholdMinutes, getInactivityNotificationDelaySeconds } from "../modules/inactivity-trigger";
import { uiCopy } from "../modules/delivery-layer";

export const INACTIVITY_NOTIFICATION_ID = "pulsation-inactivity-trigger";

/** Near-term invitations while the phone sits unused (~10–30 min gaps). */
export const INACTIVITY_NOTIFICATION_SERIES_COUNT = 6;

/** Quiet daily follow-ups for the first week if the app stays unopened. */
export const INACTIVITY_NOTIFICATION_FOLLOWUP_DAYS = 7;

/**
 * After the first week, one quiet weekly invitation so Pulsation is not forgotten.
 * 8 weeks ≈ two more months of gentle coverage (still well under iOS pending limits).
 */
export const INACTIVITY_NOTIFICATION_WEEKLY_FOLLOWUPS = 8;

const SECONDS_PER_DAY = 24 * 60 * 60;

export type InactivityNotificationPlanItem = {
  identifier: string;
  delaySeconds: number;
  kind: "near" | "daily" | "weekly";
};

function getNearSeriesIdentifier(index: number): string {
  return index === 0 ? INACTIVITY_NOTIFICATION_ID : `${INACTIVITY_NOTIFICATION_ID}-${index + 1}`;
}

function getDailyFollowupIdentifier(day: number): string {
  return `${INACTIVITY_NOTIFICATION_ID}-day-${day}`;
}

function getWeeklyFollowupIdentifier(week: number): string {
  return `${INACTIVITY_NOTIFICATION_ID}-week-${week}`;
}

/** All identifiers this build may own (near + daily + weekly). */
export function getInactivityNotificationIdentifiers(): string[] {
  const near = Array.from({ length: INACTIVITY_NOTIFICATION_SERIES_COUNT }, (_, index) =>
    getNearSeriesIdentifier(index),
  );
  const daily = Array.from({ length: INACTIVITY_NOTIFICATION_FOLLOWUP_DAYS }, (_, index) =>
    getDailyFollowupIdentifier(index + 1),
  );
  const weekly = Array.from({ length: INACTIVITY_NOTIFICATION_WEEKLY_FOLLOWUPS }, (_, index) =>
    getWeeklyFollowupIdentifier(index + 1),
  );
  return [...near, ...daily, ...weekly];
}

/**
 * Near series at adaptive gaps, then daily for a week, then weekly
 * so the queue does not go silent if someone forgets the app.
 */
export function buildInactivityNotificationPlan(delaySeconds: number): InactivityNotificationPlanItem[] {
  const gap = Math.max(1, Math.round(delaySeconds));
  const plan: InactivityNotificationPlanItem[] = [];

  for (let index = 0; index < INACTIVITY_NOTIFICATION_SERIES_COUNT; index += 1) {
    plan.push({
      identifier: getNearSeriesIdentifier(index),
      delaySeconds: gap * (index + 1),
      kind: "near",
    });
  }

  for (let day = 1; day <= INACTIVITY_NOTIFICATION_FOLLOWUP_DAYS; day += 1) {
    plan.push({
      identifier: getDailyFollowupIdentifier(day),
      delaySeconds: gap + day * SECONDS_PER_DAY,
      kind: "daily",
    });
  }

  // Week 1 = day 14, week 2 = day 21, … after the 7 daily follow-ups.
  for (let week = 1; week <= INACTIVITY_NOTIFICATION_WEEKLY_FOLLOWUPS; week += 1) {
    const dayOffset = INACTIVITY_NOTIFICATION_FOLLOWUP_DAYS + week * 7;
    plan.push({
      identifier: getWeeklyFollowupIdentifier(week),
      delaySeconds: gap + dayOffset * SECONDS_PER_DAY,
      kind: "weekly",
    });
  }

  return plan;
}

function isInactivityNotificationIdentifier(identifier: string): boolean {
  return (
    identifier === INACTIVITY_NOTIFICATION_ID ||
    identifier.startsWith(`${INACTIVITY_NOTIFICATION_ID}-`)
  );
}

async function cancelScheduledInactivityNotifications(): Promise<void> {
  // Cancel by prefix so older builds (series-only or day-lookahead-only) are cleared.
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const owned = scheduled
      .map((item) => item.identifier)
      .filter((id): id is string => typeof id === "string" && isInactivityNotificationIdentifier(id));
    for (const identifier of owned) {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    }
    if (owned.length > 0) return;
  } catch {
    // Fall through to known-id cancel.
  }

  for (const identifier of getInactivityNotificationIdentifiers()) {
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
    const plan = buildInactivityNotificationPlan(delaySeconds);

    for (const item of plan) {
      await Notifications.scheduleNotificationAsync({
        identifier: item.identifier,
        content: {
          title: uiCopy.inactivityNotificationTitle,
          body: uiCopy.inactivityNotificationBody,
          data: { route: "/trigger" },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: item.delaySeconds,
          repeats: false,
        },
      });
    }
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
