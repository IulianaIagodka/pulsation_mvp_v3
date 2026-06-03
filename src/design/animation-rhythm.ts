export const copyReveal = {
  /** Brief beat after route fade, then text fades in. */
  delayMs: 480,
  fadeMs: 1600,
  /** Gap before the next line in a sequence. */
  lineGapMs: 400,
} as const;

export const breathingRhythm = {
  spiral: {
    /** Expand + brighten — quicker rise, brief peak. */
    inhaleMs: 2200,
    holdMs: 500,
    /** Contract + dim — slightly longer than inhale for a natural exhale. */
    exhaleMs: 2900,
    /** Brief stillness at the bottom of the breath before the next inhale. */
    postExhaleHoldMs: 450,
    scaleExhale: 1,
    scaleInhale: 1.2,
    haloScaleExhale: 1,
    haloScaleInhale: 1.24,
    opacityExhale: 0.88,
    opacityInhale: 1,
  },
  findThreeThings: {
    autoRevealIntervalMs: copyReveal.fadeMs + copyReveal.lineGapMs,
    revealDurationMs: copyReveal.fadeMs,
  },
  triangleBreath: {
    cycles: 3,
    inhaleMs: 4000,
    holdMs: 2000,
    exhaleMs: 5000,
    labelFadeMs: 600,
  },
  explanationText: {
    fadeMs: copyReveal.fadeMs,
    textOpacity: 0.58,
    primaryDelayMs: copyReveal.delayMs,
    secondaryDelayMs: copyReveal.lineGapMs,
  },
  motion: {
    screenFadeMs: 450,
    textFadeInMs: copyReveal.fadeMs,
    textFadeOutMs: 900,
  },
  /** @deprecated Use {@link copyReveal}. */
  returnScreen: { primaryDelayMs: copyReveal.delayMs },
  /** @deprecated Use {@link copyReveal}. */
  triggerScreen: { primaryDelayMs: copyReveal.delayMs, fadeMs: copyReveal.fadeMs },
  /** @deprecated Use {@link copyReveal}. */
  actionScreen: { primaryDelayMs: copyReveal.delayMs },
} as const;

/** Main line — same delay on every screen. */
export function getMainCopyDelayMs(): number {
  return copyReveal.delayMs;
}

/** Main / auxiliary fade duration — same on every screen. */
export function getMainCopyFadeMs(): number {
  return copyReveal.fadeMs;
}

/** When the next line starts fading (after previous line finishes). */
export function getAuxiliaryCopyDelayMs(mainLineDelayMs: number = getMainCopyDelayMs()): number {
  return mainLineDelayMs + copyReveal.fadeMs + copyReveal.lineGapMs;
}

/** @deprecated Use {@link getMainCopyFadeMs}. */
export const onboardingRhythm = {
  fadeMs: copyReveal.fadeMs,
  afterHeadlineMs: copyReveal.lineGapMs,
  stepGapMs: copyReveal.lineGapMs,
} as const;

function getOnboardingStepGapMs(): number {
  return copyReveal.fadeMs + copyReveal.lineGapMs;
}

/** Onboarding subtitle (0) and each step (1…n). */
export function getOnboardingExplanationDelayMs(lineIndex: number): number {
  const firstAuxiliaryMs = getAuxiliaryCopyDelayMs(copyReveal.delayMs);
  if (lineIndex === 0) {
    return firstAuxiliaryMs;
  }
  return firstAuxiliaryMs + getOnboardingStepGapMs() * lineIndex;
}

/** Onboarding: “tap the spiral” after headline or after all steps. */
export function getOnboardingSpiralHintDelayMs(stepCount: number): number {
  const stepGap = getOnboardingStepGapMs();
  if (stepCount === 0) {
    return getFlowSpiralHintDelayMs(copyReveal.delayMs);
  }
  const lastStepDelayMs = getAuxiliaryCopyDelayMs(copyReveal.delayMs) + stepGap * (stepCount - 1);
  return getFlowSpiralHintDelayMs(lastStepDelayMs);
}

const flowHintGapMs = copyReveal.lineGapMs;

/** Flow screens: hint after the last line finishes fading. */
export function getFlowSpiralHintDelayMs(lastLineDelayMs: number): number {
  return lastLineDelayMs + copyReveal.fadeMs + flowHintGapMs;
}

/** Hint after the last find-three bullet begins appearing. */
export function getFindThreeSpiralHintDelayMs(
  bulletCount: number,
  mainLineDelayMs: number = getMainCopyDelayMs(),
): number {
  const intervals = Math.max(0, bulletCount - 1);
  const lastBulletStartMs =
    getFindThreeBulletsStartDelayMs(mainLineDelayMs) +
    breathingRhythm.findThreeThings.autoRevealIntervalMs * intervals;
  return lastBulletStartMs + copyReveal.fadeMs + flowHintGapMs;
}

/** Delay from mount when gated content (e.g. all bullets) just became visible. */
export function getFlowSpiralHintDelayAfterRevealMs(): number {
  return copyReveal.fadeMs + flowHintGapMs;
}

/** "Tap the spiral" delays — always after other copy on that screen. */
export const spiralHintTiming = {
  onboardingAfterMainMs: getOnboardingSpiralHintDelayMs(0),
  triggerAfterPromptMs: getFlowSpiralHintDelayMs(copyReveal.delayMs),
  returnAfterFollowUpMs: getFlowSpiralHintDelayMs(getAuxiliaryCopyDelayMs(copyReveal.delayMs)),
  returnAfterBodyMs: getFlowSpiralHintDelayMs(copyReveal.delayMs),
  actionAfterFeetInstructionMs: getFlowSpiralHintDelayMs(copyReveal.delayMs),
  actionAfterFindThreeMs: getFindThreeSpiralHintDelayMs(3),
} as const;

/** Return screen: "Save this for me" when the follow-up explanation begins. */
export function getReturnKeepForMeDelayMs(mainLineDelayMs: number = getMainCopyDelayMs()): number {
  return getAuxiliaryCopyDelayMs(mainLineDelayMs);
}

export const spiralLayout = {
  size: 136,
  anchorRatio: 0.36,
  textGap: 12,
  hintBelowSpiralGap: 10,
  hintToContentGap: 52,
  slotMinHeight: 160,
} as const;

/** First find-three bullet — after main intro finishes fading. */
export function getFindThreeBulletsStartDelayMs(mainLineDelayMs: number = getMainCopyDelayMs()): number {
  return getAuxiliaryCopyDelayMs(mainLineDelayMs);
}

/** @deprecated Use {@link getFindThreeBulletsStartDelayMs}. */
export function getFindThreeIntroDelayMs(mainLineDelayMs: number = getMainCopyDelayMs()): number {
  return getFindThreeBulletsStartDelayMs(mainLineDelayMs);
}

/** Phase labels start after main intro + calm gap. */
export function getTriangleBreathIntroDelayMs(mainLineDelayMs: number = getMainCopyDelayMs()): number {
  return getAuxiliaryCopyDelayMs(mainLineDelayMs);
}

export function getTriangleBreathSpiralCycleMs(): number {
  const { inhaleMs, holdMs, exhaleMs } = breathingRhythm.triangleBreath;
  return inhaleMs + holdMs + exhaleMs;
}

export function getTriangleBreathLabelCycleMs(): number {
  const { inhaleMs, holdMs, exhaleMs, labelFadeMs } = breathingRhythm.triangleBreath;
  const fade = labelFadeMs;
  const phaseVisible = (phaseMs: number) => Math.max(0, phaseMs - fade * 2);
  return fade * 6 + phaseVisible(inhaleMs) + phaseVisible(holdMs) + phaseVisible(exhaleMs);
}

export function getTriangleBreathTotalMs(): number {
  const { cycles } = breathingRhythm.triangleBreath;
  return getTriangleBreathLabelCycleMs() * cycles;
}
