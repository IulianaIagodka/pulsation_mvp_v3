import { footerFaintLinkOpacity } from "../design/tokens";
import { hasFlowCopyRevealed } from "../design/flow-copy-reveal";
import { flowRevealIds } from "../design/flow-reveal-ids";
import { getSchedulingProfile, recordTapHintRevealedAtCycle } from "../data/repositories/scheduling-profile-repo";

export type CirclesHintPresentation = {
  shouldShow: boolean;
  delayMs: number;
  textOpacity: number;
};

/** Keep tap hint visible for this many completed cycles after it first appears. */
export const CIRCLES_HINT_GRACE_CYCLES = 2;

/** Anchor when grace was never persisted but the hint already appeared in-session. */
export function getRetroactiveTapHintAnchorCycle(completedCycles: number): number {
  return Math.max(0, completedCycles - CIRCLES_HINT_GRACE_CYCLES);
}

/** @deprecated Use {@link CIRCLES_HINT_GRACE_CYCLES}. */
export const CIRCLES_HINT_FULL_CYCLES = CIRCLES_HINT_GRACE_CYCLES;

/** Matches footer links (`AboutFooterLink` faint tone). */
const fullHintOpacity = footerFaintLinkOpacity;

export function shouldShowTapHint(
  completedCycles: number,
  hintRevealedAtCycle: number | null = null,
): boolean {
  if (hintRevealedAtCycle == null) {
    return true;
  }
  return completedCycles < hintRevealedAtCycle + CIRCLES_HINT_GRACE_CYCLES;
}

/** Keep tap hint visible across flow screens during the grace window (not while fading out). */
export function shouldPersistFlowTapHint(fadeOutDelayMs?: number): boolean {
  if (fadeOutDelayMs != null) {
    return false;
  }
  if (!hasFlowCopyRevealed(flowRevealIds.flowCirclesHint)) {
    return false;
  }
  const profile = getSchedulingProfile();
  let hintAtCycle = profile.tapHintRevealedAtCycle ?? null;
  if (hintAtCycle == null) {
    recordTapHintRevealedAtCycle();
    hintAtCycle = getSchedulingProfile().tapHintRevealedAtCycle ?? null;
  }
  return shouldShowTapHint(profile.totalCompleted, hintAtCycle);
}

/** Last return in the grace window — hint fades out once after all copy is shown. */
export function isLastGraceReturnCycle(
  completedCycles: number,
  hintRevealedAtCycle: number | null,
): boolean {
  if (hintRevealedAtCycle == null) {
    return false;
  }
  return completedCycles === hintRevealedAtCycle + CIRCLES_HINT_GRACE_CYCLES;
}

export function getCirclesHintPresentation(
  _circlesTapCount: number,
  baseDelayMs: number,
  _screenSalt: number,
  completedCycles = 0,
  hintRevealedAtCycle: number | null = null,
): CirclesHintPresentation {
  if (!shouldShowTapHint(completedCycles, hintRevealedAtCycle)) {
    return { shouldShow: false, delayMs: baseDelayMs, textOpacity: 0 };
  }

  return {
    shouldShow: true,
    delayMs: baseDelayMs,
    textOpacity: fullHintOpacity,
  };
}

/** Return is last in the cycle — keep hint visible once more so it can fade out in place. */
export function withLastGraceReturnTapHint(
  presentation: CirclesHintPresentation,
  completedCycles: number,
  hintRevealedAtCycle: number | null,
): CirclesHintPresentation {
  if (
    !isLastGraceReturnCycle(completedCycles, hintRevealedAtCycle) ||
    !hasFlowCopyRevealed(flowRevealIds.flowCirclesHint)
  ) {
    return presentation;
  }
  return {
    ...presentation,
    shouldShow: true,
    textOpacity: fullHintOpacity,
  };
}
