import { breathingRhythm, copyReveal, getMainCopyDelayMs } from "./animation-rhythm";

let pendingEntryDelayMs = 0;

/** Call before leaving a flow/onboarding screen so the next screen waits for exit. */
export function armFlowScreenEntryDelay(
  durationMs: number = breathingRhythm.motion.screenFadeMs,
): void {
  pendingEntryDelayMs = durationMs;
}

export function consumeFlowScreenEntryDelayMs(): number {
  const ms = pendingEntryDelayMs;
  pendingEntryDelayMs = 0;
  return ms;
}

/** Main copy delay on entry — base rhythm plus time for the previous screen to fade out. */
export function getFlowMainCopyDelayMs(): number {
  return getMainCopyDelayMs() + consumeFlowScreenEntryDelayMs();
}

export const __flowScreenTransitionInternals = {
  resetForTests() {
    pendingEntryDelayMs = 0;
  },
};
