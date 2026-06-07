export const copyReveal = {
  /** Brief beat after route fade, then text fades in. */
  delayMs: 480,
  fadeMs: 1600,
  /** Gap before the next line in a sequence. */
  lineGapMs: 400,
} as const;

export const breathingRhythm = {
  circles: {
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

/** Extended onboarding — fade + read beat per line; tap hint after the last line is readable. */
export const onboardingCopy = {
  /** Brief beat to read the headline after it has fully faded in. */
  headlineHoldMs: 1800,
  headlineFadeOutMs: 800,
  stepFadeMs: 1800,
  /** Pause to read each how-it-works line after it has fully faded in. */
  stepReadMs: 1400,
  hintGapMs: copyReveal.lineGapMs,
} as const;

/** Beat to read the headline after it finishes fading in, before it fades out. */
export function getOnboardingHeadlineHoldMs(): number {
  return onboardingCopy.headlineHoldMs;
}

export function getOnboardingHeadlineFadeOutMs(): number {
  return onboardingCopy.headlineFadeOutMs;
}

/** Fade-in + read time — next line starts only after the previous is readable. */
export function getOnboardingStepLineCycleMs(): number {
  return onboardingCopy.stepFadeMs + onboardingCopy.stepReadMs;
}

/** When “How it works” block mounts (headline crossfade — matches `OnboardingPhasedContent`). */
export function getOnboardingHowItWorksMountDelayMs(): number {
  return copyReveal.delayMs + copyReveal.fadeMs + getOnboardingHeadlineHoldMs();
}

/** @deprecated Use {@link getOnboardingHowItWorksMountDelayMs} + headline fade-out. */
export function getOnboardingHowItWorksStartDelayMs(): number {
  return getOnboardingHowItWorksMountDelayMs() + getOnboardingHeadlineFadeOutMs();
}

/** Last line index: subtitle (0) + `stepCount` steps → index `stepCount`. */
export function getOnboardingLastLineIndex(stepCount: number): number {
  return stepCount;
}

/** Delay from “How it works” mount — subtitle (0), then each step (1…n). */
export function getOnboardingStepRevealDelayMs(lineIndex: number): number {
  return getOnboardingStepLineCycleMs() * lineIndex;
}

/** Absolute delay from screen mount (screenshot / tests). */
export function getOnboardingExplanationDelayMs(lineIndex: number): number {
  return getOnboardingHowItWorksMountDelayMs() + getOnboardingStepRevealDelayMs(lineIndex);
}

/** Tap circles — after the last line (subtitle + all steps) has faded in and been readable. */
export function getOnboardingCirclesHintDelayMs(stepCount: number): number {
  if (stepCount === 0) {
    return getFlowTapHintDelayMs(copyReveal.delayMs);
  }
  const lastLineStart = getOnboardingExplanationDelayMs(getOnboardingLastLineIndex(stepCount));
  return (
    lastLineStart +
    onboardingCopy.stepFadeMs +
    onboardingCopy.stepReadMs +
    onboardingCopy.hintGapMs
  );
}

const flowHintGapMs = copyReveal.lineGapMs;

/** Flow screens: hint after the last line finishes fading. */
export function getFlowTapHintDelayMs(lastLineDelayMs: number): number {
  return lastLineDelayMs + copyReveal.fadeMs + flowHintGapMs;
}

/** Trigger footer: paths link together with main copy. */
export function getTriggerPathsLinkDelayMs(mainLineDelayMs: number = getMainCopyDelayMs()): number {
  return mainLineDelayMs;
}

/** Trigger: tap hint after main copy and paths link have appeared. */
export function getTriggerTapHintDelayMs(mainLineDelayMs: number = getMainCopyDelayMs()): number {
  return getFlowTapHintDelayMs(mainLineDelayMs);
}

/** Return: tap hint after main line, follow-up, and keep-for-me footer. */
export function getReturnTapHintDelayMs(mainLineDelayMs: number = getMainCopyDelayMs()): number {
  return getFlowTapHintDelayMs(getReturnKeepForMeDelayMs(mainLineDelayMs));
}

/** Hint after the last find-three bullet begins appearing. */
export function getFindThreeTapHintDelayMs(
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
export function getFlowTapHintDelayAfterRevealMs(): number {
  return copyReveal.fadeMs + flowHintGapMs;
}

/** Tap-hint delays — always after other copy on that screen. */
export const tapHintTiming = {
  onboardingAfterMainMs: getOnboardingCirclesHintDelayMs(0),
  triggerPathsLinkMs: getTriggerPathsLinkDelayMs(copyReveal.delayMs),
  triggerTapHintMs: getTriggerTapHintDelayMs(copyReveal.delayMs),
  returnTapHintMs: getReturnTapHintDelayMs(copyReveal.delayMs),
  returnAfterFollowUpMs: getFlowTapHintDelayMs(getAuxiliaryCopyDelayMs(copyReveal.delayMs)),
  returnAfterBodyMs: getFlowTapHintDelayMs(copyReveal.delayMs),
  actionAfterFeetInstructionMs: getFlowTapHintDelayMs(copyReveal.delayMs),
  actionAfterFindThreeMs: getFindThreeTapHintDelayMs(3),
} as const;

/** Return screen: "Save this for me" when the follow-up explanation begins. */
export function getReturnKeepForMeDelayMs(mainLineDelayMs: number = getMainCopyDelayMs()): number {
  return getAuxiliaryCopyDelayMs(mainLineDelayMs);
}

export const circlesLayout = {
  size: 136,
  anchorRatio: 0.36,
  textGap: 12,
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

export function getTriangleBreathCirclesCycleMs(): number {
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
