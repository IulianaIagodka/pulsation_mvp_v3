export type CirclesHintPresentation = {
  shouldShow: boolean;
  delayMs: number;
  textOpacity: number;
};

/** Show “tap circles” on flow screens only for the first N completed cycles. */
export const SPIRAL_HINT_FULL_CYCLES = 3;

const fullHintOpacity = 0.58;

export function getCirclesHintPresentation(
  _circlesTapCount: number,
  baseDelayMs: number,
  _screenSalt: number,
  completedCycles = 0,
): CirclesHintPresentation {
  if (completedCycles >= SPIRAL_HINT_FULL_CYCLES) {
    return { shouldShow: false, delayMs: baseDelayMs, textOpacity: 0 };
  }

  return {
    shouldShow: true,
    delayMs: baseDelayMs,
    textOpacity: fullHintOpacity,
  };
}
