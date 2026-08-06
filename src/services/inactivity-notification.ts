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

/**
 * Daily/weekly follow-ups land in this local-hour window so a late-evening
 * background does not pin the next day's invitation to after 22:00.
 */
export const INACTIVITY_FOLLOWUP_DAYTIME_START_HOUR = 10;
export const INACTIVITY_FOLLOWUP_DAYTIME_END_HOUR = 20;

/** No local invitations between these local hours (23:00–07:00). */
export const INACTIVITY_QUIET_HOURS_START = 23;
export const INACTIVITY_QUIET_HOURS_END = 7;

const SECONDS_PER_DAY = 24 * 60 * 60;
const MS_PER_SECOND = 1000;

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

export function isInQuietHours(
  at: Date,
  quietStartHour = INACTIVITY_QUIET_HOURS_START,
  quietEndHour = INACTIVITY_QUIET_HOURS_END,
): boolean {
  const hour = at.getHours();
  return quietStartHour > quietEndHour
    ? hour >= quietStartHour || hour < quietEndHour
    : hour >= quietStartHour && hour < quietEndHour;
}

/**
 * Move a fire time out of the overnight quiet window (23:00–07:00).
 * Preserves minutes so clustered snaps can still be destaggered by gap.
 */
export function snapOutOfQuietHours(
  targetMs: number,
  earliestMs: number,
  quietStartHour = INACTIVITY_QUIET_HOURS_START,
  quietEndHour = INACTIVITY_QUIET_HOURS_END,
): number {
  let candidate = Math.max(targetMs, earliestMs);
  const target = new Date(candidate);
  if (!isInQuietHours(target, quietStartHour, quietEndHour)) {
    return candidate;
  }

  const snapped = new Date(candidate);
  if (target.getHours() >= quietStartHour) {
    snapped.setDate(snapped.getDate() + 1);
  }
  snapped.setHours(quietEndHour, target.getMinutes(), target.getSeconds(), 0);
  candidate = snapped.getTime();

  if (candidate < earliestMs) {
    snapped.setDate(snapped.getDate() + 1);
    snapped.setHours(quietEndHour, target.getMinutes(), target.getSeconds(), 0);
    candidate = snapped.getTime();
  }

  return Math.max(candidate, earliestMs);
}

/**
 * Move a follow-up timestamp into the preferred daytime window when it would
 * otherwise land late at night or before morning. Preserves minutes from the
 * original target so reminders stay slightly varied.
 */
export function snapFollowupToDaytimeWindow(
  targetMs: number,
  earliestMs: number,
  daytimeStartHour = INACTIVITY_FOLLOWUP_DAYTIME_START_HOUR,
  daytimeEndHour = INACTIVITY_FOLLOWUP_DAYTIME_END_HOUR,
): number {
  const target = new Date(targetMs);
  const hour = target.getHours();
  const inWindow = hour >= daytimeStartHour && hour < daytimeEndHour;

  if (inWindow && targetMs >= earliestMs) {
    return targetMs;
  }

  const snapOnDay = (day: Date): number => {
    const snapped = new Date(day);
    snapped.setHours(daytimeStartHour, target.getMinutes(), target.getSeconds(), 0);
    return snapped.getTime();
  };

  let candidate = snapOnDay(target);
  // Past end of window (e.g. 22:15) → morning of that calendar day.
  // Before start (e.g. 07:10) → morning of that calendar day.
  // If that morning is already too soon (still inside / before near series), push one day.
  if (candidate < earliestMs) {
    const nextDay = new Date(target);
    nextDay.setDate(nextDay.getDate() + 1);
    candidate = snapOnDay(nextDay);
  }

  return Math.max(candidate, earliestMs);
}

function delaySecondsFromNow(targetMs: number, nowMs: number): number {
  return Math.max(1, Math.round((targetMs - nowMs) / MS_PER_SECOND));
}

function finalizeFireTime(
  rawMs: number,
  kind: InactivityNotificationPlanItem["kind"],
  earliestMs: number,
  lastFireMs: number,
  gapSeconds: number,
): number {
  let fireMs = Math.max(rawMs, lastFireMs + gapSeconds * MS_PER_SECOND);

  if (kind === "daily" || kind === "weekly") {
    fireMs = snapFollowupToDaytimeWindow(fireMs, earliestMs);
  }

  fireMs = snapOutOfQuietHours(fireMs, earliestMs);

  // Snapping overnight can collapse several near items onto ~07:00 — restack with gap.
  if (fireMs <= lastFireMs) {
    fireMs = snapOutOfQuietHours(lastFireMs + gapSeconds * MS_PER_SECOND, earliestMs);
  }

  return fireMs;
}

/**
 * Near series at adaptive gaps, then daily for a week, then weekly
 * so the queue does not go silent if someone forgets the app.
 *
 * No invitations fire between 23:00 and 07:00 local time. Daily/weekly times
 * also snap into 10:00–20:00 so late backgrounds do not leave a silent day.
 */
export function buildInactivityNotificationPlan(
  delaySeconds: number,
  nowMs: number = Date.now(),
): InactivityNotificationPlanItem[] {
  const gap = Math.max(1, Math.round(delaySeconds));
  const plan: InactivityNotificationPlanItem[] = [];
  const earliestMs = nowMs + gap * MS_PER_SECOND;
  const earliestFollowupMs = nowMs + gap * INACTIVITY_NOTIFICATION_SERIES_COUNT * MS_PER_SECOND;
  let lastFireMs = nowMs;

  for (let index = 0; index < INACTIVITY_NOTIFICATION_SERIES_COUNT; index += 1) {
    const rawMs = nowMs + gap * (index + 1) * MS_PER_SECOND;
    const fireMs = finalizeFireTime(rawMs, "near", earliestMs, lastFireMs, gap);
    lastFireMs = fireMs;
    plan.push({
      identifier: getNearSeriesIdentifier(index),
      delaySeconds: delaySecondsFromNow(fireMs, nowMs),
      kind: "near",
    });
  }

  for (let day = 1; day <= INACTIVITY_NOTIFICATION_FOLLOWUP_DAYS; day += 1) {
    const rawMs = nowMs + (gap + day * SECONDS_PER_DAY) * MS_PER_SECOND;
    const fireMs = finalizeFireTime(rawMs, "daily", earliestFollowupMs, lastFireMs, gap);
    lastFireMs = fireMs;
    plan.push({
      identifier: getDailyFollowupIdentifier(day),
      delaySeconds: delaySecondsFromNow(fireMs, nowMs),
      kind: "daily",
    });
  }

  for (let week = 1; week <= INACTIVITY_NOTIFICATION_WEEKLY_FOLLOWUPS; week += 1) {
    const dayOffset = INACTIVITY_NOTIFICATION_FOLLOWUP_DAYS + week * 7;
    const rawMs = nowMs + (gap + dayOffset * SECONDS_PER_DAY) * MS_PER_SECOND;
    const fireMs = finalizeFireTime(rawMs, "weekly", earliestFollowupMs, lastFireMs, gap);
    lastFireMs = fireMs;
    plan.push({
      identifier: getWeeklyFollowupIdentifier(week),
      delaySeconds: delaySecondsFromNow(fireMs, nowMs),
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
