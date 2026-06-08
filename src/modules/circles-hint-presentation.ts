import { footerFaintLinkOpacity } from "../design/tokens";

export type CirclesHintPresentation = {
  shouldShow: boolean;
  delayMs: number;
  textOpacity: number;
};

/** Keep tap hint visible for this many completed cycles after it first appears. */
export const CIRCLES_HINT_GRACE_CYCLES = 2;

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
  if (!isLastGraceReturnCycle(completedCycles, hintRevealedAtCycle)) {
    return presentation;
  }
  return {
    ...presentation,
    shouldShow: true,
    textOpacity: fullHintOpacity,
  };
}
