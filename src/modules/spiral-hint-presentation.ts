export type SpiralHintPresentation = {
  shouldShow: boolean;
  delayMs: number;
  textOpacity: number;
};

/** Show “tap the spiral” on flow screens only for the first N completed cycles. */
export const SPIRAL_HINT_FULL_CYCLES = 3;

const fullHintOpacity = 0.58;

export function getSpiralHintPresentation(
  _spiralTapCount: number,
  baseDelayMs: number,
  _screenSalt: number,
  completedCycles = 0,
): SpiralHintPresentation {
  if (completedCycles >= SPIRAL_HINT_FULL_CYCLES) {
    return { shouldShow: false, delayMs: baseDelayMs, textOpacity: 0 };
  }

  return {
    shouldShow: true,
    delayMs: baseDelayMs,
    textOpacity: fullHintOpacity,
  };
}
