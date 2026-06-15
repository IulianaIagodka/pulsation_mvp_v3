import { breathingRhythm, getFlowCopyTimeline } from "./animation-rhythm";

let pendingEntryDelayMs = 0;

function normalizeDelayMs(durationMs: number): number {
  return Number.isFinite(durationMs) ? Math.max(0, durationMs) : 0;
}

/** Call before leaving a flow/onboarding screen so the next screen waits for exit. */
export function armFlowScreenEntryDelay(
  durationMs: number = breathingRhythm.motion.screenFadeMs,
): void {
  pendingEntryDelayMs = Math.max(pendingEntryDelayMs, normalizeDelayMs(durationMs));
}

export function peekFlowScreenEntryDelayMs(): number {
  return pendingEntryDelayMs;
}

export function consumeFlowScreenEntryDelayMs(): number {
  const ms = pendingEntryDelayMs;
  pendingEntryDelayMs = 0;
  return ms;
}

/** Main copy delay on entry — base rhythm plus time for the previous screen to fade out. */
export function getFlowMainCopyDelayMs(): number {
  return getFlowCopyTimeline(consumeFlowScreenEntryDelayMs()).mainDelayMs;
}

export const __flowScreenTransitionInternals = {
  resetForTests() {
    pendingEntryDelayMs = 0;
  },
};
