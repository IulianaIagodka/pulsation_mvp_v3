let currentState: "active" | "background" | "inactive" = "active";
let activeStartedAt = Date.now();
let accumulatedActiveMs = 0;

export function recordAppStateChange(nextState: "active" | "background" | "inactive") {
  const now = Date.now();
  if (currentState === "active" && nextState !== "active") {
    accumulatedActiveMs += Math.max(0, now - activeStartedAt);
  }
  if (currentState !== "active" && nextState === "active") {
    activeStartedAt = now;
  }
  currentState = nextState;
}

export function getActiveSessionMinutes() {
  const now = Date.now();
  const liveActiveMs =
    currentState === "active" ? Math.max(0, now - activeStartedAt) : 0;
  return Math.floor((accumulatedActiveMs + liveActiveMs) / 60000);
}

export const __sessionRuntimeInternals = {
  resetForTests() {
    currentState = "active";
    activeStartedAt = Date.now();
    accumulatedActiveMs = 0;
  },
};
