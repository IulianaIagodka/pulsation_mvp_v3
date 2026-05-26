let currentState: "active" | "background" | "inactive" = "active";
let activeStartedAt = Date.now();
let accumulatedActiveMs = 0;
let backgroundStartedAt: number | null = null;
let hasBeenBackgrounded = false;
let pendingInactiveMinutes = 0;

export function recordAppStateChange(nextState: "active" | "background" | "inactive") {
  const now = Date.now();
  if (currentState === "active" && nextState !== "active") {
    accumulatedActiveMs += Math.max(0, now - activeStartedAt);
    backgroundStartedAt = now;
    hasBeenBackgrounded = true;
  }
  if (currentState !== "active" && nextState === "active") {
    activeStartedAt = now;
    if (backgroundStartedAt != null) {
      pendingInactiveMinutes = Math.floor((now - backgroundStartedAt) / 60000);
      backgroundStartedAt = null;
    } else {
      pendingInactiveMinutes = 0;
    }
  }
  currentState = nextState;
}

export function consumeInactiveMinutesOnResume(): number {
  if (!hasBeenBackgrounded) return 0;
  const minutes = pendingInactiveMinutes;
  pendingInactiveMinutes = 0;
  return minutes;
}

export function getActiveSessionMinutes() {
  const now = Date.now();
  const liveActiveMs = currentState === "active" ? Math.max(0, now - activeStartedAt) : 0;
  return Math.floor((accumulatedActiveMs + liveActiveMs) / 60000);
}

export function getPendingInactiveMinutes() {
  return pendingInactiveMinutes;
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
