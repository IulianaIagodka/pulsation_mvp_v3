export type SpiralHintPresentation = {
  shouldShow: boolean;
  delayMs: number;
  textOpacity: number;
};

type HintTier = "full" | "soft" | "subtle" | "hidden";

function getHintTier(spiralTapCount: number): HintTier {
  if (spiralTapCount <= 2) return "full";
  if (spiralTapCount <= 6) return "soft";
  if (spiralTapCount <= 14) return "subtle";
  return "hidden";
}

function shouldShowSubtleHint(spiralTapCount: number, screenSalt: number): boolean {
  return (spiralTapCount + screenSalt) % 4 === 0;
}

export function getSpiralHintPresentation(
  spiralTapCount: number,
  baseDelayMs: number,
  screenSalt: number,
): SpiralHintPresentation {
  const tier = getHintTier(spiralTapCount);

  if (tier === "hidden") {
    return { shouldShow: false, delayMs: baseDelayMs, textOpacity: 0 };
  }

  if (tier === "subtle") {
    return {
      shouldShow: shouldShowSubtleHint(spiralTapCount, screenSalt),
      delayMs: baseDelayMs + 2800,
      textOpacity: 0.24,
    };
  }

  if (tier === "soft") {
    const tierDelay = (spiralTapCount + screenSalt) % 2 === 0 ? 2200 : 2800;
    return {
      shouldShow: true,
      delayMs: baseDelayMs + tierDelay,
      textOpacity: 0.38,
    };
  }

  return {
    shouldShow: true,
    delayMs: baseDelayMs,
    textOpacity: 0.52,
  };
}
