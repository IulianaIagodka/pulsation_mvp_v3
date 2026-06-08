import type { AppStateStatus } from "react-native";
import {
  clearAppBackgrounded,
  getSchedulingProfile,
  recordAppBackgrounded,
} from "../data/repositories/scheduling-profile-repo";

let currentState: "active" | "background" | "inactive" = "active";
let activeStartedAt = Date.now();
let accumulatedActiveMs = 0;
let backgroundStartedAt: number | null = null;
let hasBeenBackgrounded = false;
let pendingInactiveMinutes = 0;

/** Same JS process resumed from background — not a cold start after kill. */
export function isWarmProcessResume(): boolean {
  return hasBeenBackgrounded || backgroundStartedAt != null;
}

export function hadBackgroundSession(): boolean {
  const now = Date.now();
  return (
    isWarmProcessResume() ||
    getSchedulingProfile().lastBackgroundAt != null ||
    getPersistedBackgroundMinutes(now) > 0
  );
}

function getPersistedBackgroundMinutes(now: number): number {
  const lastBackgroundAt = getSchedulingProfile().lastBackgroundAt;
  if (!lastBackgroundAt) return 0;
  return Math.max(0, Math.floor((now - lastBackgroundAt) / 60000));
}

function resolveInactiveMinutes(now: number): number {
  const fromPending = pendingInactiveMinutes;
  const fromOngoing =
    backgroundStartedAt != null
      ? Math.max(0, Math.floor((now - backgroundStartedAt) / 60000))
      : 0;
  const fromPersisted = getPersistedBackgroundMinutes(now);
  return Math.max(fromPending, fromOngoing, fromPersisted);
}

export function recordAppStateChange(nextStateRaw: AppStateStatus) {
  const nextState: "active" | "background" | "inactive" =
    nextStateRaw === "active" || nextStateRaw === "background" || nextStateRaw === "inactive"
      ? nextStateRaw
      : currentState;
  const now = Date.now();
  if (currentState === "active" && nextState !== "active") {
    accumulatedActiveMs += Math.max(0, now - activeStartedAt);
    backgroundStartedAt = now;
    hasBeenBackgrounded = true;
    recordAppBackgrounded(now);
  }
  if (currentState !== "active" && nextState === "active") {
    activeStartedAt = now;
    if (backgroundStartedAt != null || getPersistedBackgroundMinutes(now) > 0) {
      pendingInactiveMinutes = resolveInactiveMinutes(now);
      backgroundStartedAt = null;
    } else {
      pendingInactiveMinutes = 0;
    }
  }
  currentState = nextState;
}

export function consumeInactiveMinutesOnResume(): number {
  const now = Date.now();
  const hasPersistedBackground = getPersistedBackgroundMinutes(now) > 0;
  if (!hasBeenBackgrounded && !hasPersistedBackground) {
    return 0;
  }

  const minutes = resolveInactiveMinutes(now);
  pendingInactiveMinutes = 0;
  backgroundStartedAt = null;
  hasBeenBackgrounded = false;
  clearAppBackgrounded();
  return minutes;
}

export function getActiveSessionMinutes() {
  const now = Date.now();
  const liveActiveMs = currentState === "active" ? Math.max(0, now - activeStartedAt) : 0;
  return Math.floor((accumulatedActiveMs + liveActiveMs) / 60000);
}

export function getPendingInactiveMinutes() {
  const now = Date.now();
  return resolveInactiveMinutes(now);
}

export const __sessionRuntimeInternals = {
  resetForTests() {
    currentState = "active";
    activeStartedAt = Date.now();
    accumulatedActiveMs = 0;
    backgroundStartedAt = null;
    hasBeenBackgrounded = false;
    pendingInactiveMinutes = 0;
  },
  setPendingInactiveMinutes(minutes: number) {
    pendingInactiveMinutes = minutes;
    hasBeenBackgrounded = true;
  },
};
