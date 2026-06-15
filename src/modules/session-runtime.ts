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

export type ResumeSessionKind = "none" | "warm" | "cold-start";

export type ResumeSessionSnapshot = {
  kind: ResumeSessionKind;
  inactiveMinutes: number;
  warmResume: boolean;
  coldStartAfterBackground: boolean;
};

const emptyResumeSession: ResumeSessionSnapshot = {
  kind: "none",
  inactiveMinutes: 0,
  warmResume: false,
  coldStartAfterBackground: false,
};

/** Same JS process resumed from background — not a cold start after kill. */
export function isWarmProcessResume(): boolean {
  return hasBeenBackgrounded || backgroundStartedAt != null;
}

export function hadBackgroundSession(): boolean {
  return getResumeSessionSnapshot().kind !== "none";
}

function getPersistedBackgroundAt(): number | null {
  const lastBackgroundAt = getSchedulingProfile().lastBackgroundAt;
  return typeof lastBackgroundAt === "number" ? lastBackgroundAt : null;
}

function getElapsedMinutesSince(startedAt: number | null, now: number): number {
  if (startedAt == null) return 0;
  return Math.max(0, Math.floor((now - startedAt) / 60000));
}

function getPersistedBackgroundMinutes(now: number, lastBackgroundAt: number | null): number {
  if (lastBackgroundAt == null) return 0;
  return Math.max(0, Math.floor((now - lastBackgroundAt) / 60000));
}

function resolveInactiveMinutes(now: number, lastBackgroundAt: number | null): number {
  const fromPending = pendingInactiveMinutes;
  const fromOngoing = getElapsedMinutesSince(backgroundStartedAt, now);
  const fromPersisted = getPersistedBackgroundMinutes(now, lastBackgroundAt);
  return Math.max(fromPending, fromOngoing, fromPersisted);
}

export function getResumeSessionSnapshot(): ResumeSessionSnapshot {
  const now = Date.now();
  const lastBackgroundAt = getPersistedBackgroundAt();
  const inactiveMinutes = resolveInactiveMinutes(now, lastBackgroundAt);

  if (isWarmProcessResume() || pendingInactiveMinutes > 0) {
    return {
      kind: "warm",
      inactiveMinutes,
      warmResume: true,
      coldStartAfterBackground: false,
    };
  }

  if (lastBackgroundAt != null) {
    return {
      kind: "cold-start",
      inactiveMinutes,
      warmResume: false,
      coldStartAfterBackground: true,
    };
  }

  return emptyResumeSession;
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
    const lastBackgroundAt = getPersistedBackgroundAt();
    if (backgroundStartedAt != null || lastBackgroundAt != null) {
      pendingInactiveMinutes = resolveInactiveMinutes(now, lastBackgroundAt);
      backgroundStartedAt = null;
    } else {
      pendingInactiveMinutes = 0;
    }
  }
  currentState = nextState;
}

export function consumeResumeSessionOnForeground(): ResumeSessionSnapshot {
  const snapshot = getResumeSessionSnapshot();
  if (snapshot.kind === "none") return snapshot;

  pendingInactiveMinutes = 0;
  backgroundStartedAt = null;
  hasBeenBackgrounded = false;
  clearAppBackgrounded();
  return snapshot;
}

export function consumeInactiveMinutesOnResume(): number {
  return consumeResumeSessionOnForeground().inactiveMinutes;
}

export function getActiveSessionMinutes() {
  const now = Date.now();
  const liveActiveMs = currentState === "active" ? Math.max(0, now - activeStartedAt) : 0;
  return Math.floor((accumulatedActiveMs + liveActiveMs) / 60000);
}

export function getPendingInactiveMinutes() {
  return getResumeSessionSnapshot().inactiveMinutes;
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
