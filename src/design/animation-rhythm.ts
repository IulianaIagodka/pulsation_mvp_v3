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
    textOpacity: 0.75,
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

/** Return follow-up — explanation fades in a bit sooner than generic auxiliary copy. */
export const returnCopy = {
  explanationGapMs: 200,
} as const;

/** Return: soft explanation after **You are here** has faded in. */
export function getReturnExplanationDelayMs(mainLineDelayMs: number = getMainCopyDelayMs()): number {
  return mainLineDelayMs + copyReveal.fadeMs + returnCopy.explanationGapMs;
}

/** @deprecated Use {@link getMainCopyFadeMs}. */
export const onboardingRhythm = {
  fadeMs: copyReveal.fadeMs,
  afterHeadlineMs: copyReveal.lineGapMs,
  stepGapMs: copyReveal.lineGapMs,
} as const;

/** Extended onboarding — fade + read beat per line; tap hint after “Pulsation exists…” fades in. */
export const onboardingCopy = {
  /** Brief beat to read the headline after it has fully faded in. */
  headlineHoldMs: 1800,
  headlineFadeOutMs: 800,
  stepFadeMs: 1600,
  /** Pause to read each how-it-works line after it has fully faded in. */
  stepReadMs: 1000,
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

/** When “How it works” mounts — after “Pulsation exists…” has fully faded out. */
export function getOnboardingHowItWorksMountDelayMs(): number {
  return (
    copyReveal.delayMs +
    copyReveal.fadeMs +
    getOnboardingHeadlineHoldMs() +
    getOnboardingHeadlineFadeOutMs()
  );
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

/** Tap circles — right after “Pulsation exists…” has fully faded in (before How it works). */
export function getOnboardingCirclesHintDelayMs(_stepCount: number = 0): number {
  return getFlowTapHintDelayMs(copyReveal.delayMs);
}

const flowHintGapMs = copyReveal.lineGapMs;

/** Flow screens: hint after the last line finishes fading. */
export function getFlowTapHintDelayMs(lastLineDelayMs: number): number {
  return lastLineDelayMs + copyReveal.fadeMs + flowHintGapMs;
}

/** Trigger footer: Show my paths together with the main line. */
export function getTriggerPathsLinkDelayMs(mainLineDelayMs: number = getMainCopyDelayMs()): number {
  return mainLineDelayMs;
}

/** Trigger: tap hint last — after main copy has faded in. */
export function getTriggerTapHintDelayMs(mainLineDelayMs: number = getMainCopyDelayMs()): number {
  return getFlowTapHintDelayMs(mainLineDelayMs);
}

/** Return: tap hint last — with Save for me when shown; after explanation otherwise. */
export function getReturnTapHintDelayMs(
  mainLineDelayMs: number = getMainCopyDelayMs(),
  showKeepForMeFooter: boolean = true,
): number {
  return showKeepForMeFooter
    ? getReturnKeepForMeDelayMs(mainLineDelayMs)
    : getFlowTapHintDelayMs(getReturnExplanationDelayMs(mainLineDelayMs));
}

/** Return (last grace cycle): fade tap hint out after the last line has fully appeared. */
export function getReturnHintFadeOutDelayMs(
  mainLineDelayMs: number = getMainCopyDelayMs(),
  showKeepForMeFooter: boolean = true,
): number {
  const lastCopyDelay = showKeepForMeFooter
    ? getReturnKeepForMeDelayMs(mainLineDelayMs)
    : getReturnExplanationDelayMs(mainLineDelayMs);
  return lastCopyDelay + copyReveal.fadeMs + flowHintGapMs;
}

/** Action (simple): tap hint last — after the main instruction has faded in. */
export function getActionSimpleTapHintDelayMs(mainLineDelayMs: number = getMainCopyDelayMs()): number {
  return getFlowTapHintDelayMs(mainLineDelayMs);
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

/** Tap-hint delays — last on every screen; with paths / save-for-me on trigger / return when shown. */
export const tapHintTiming = {
  onboardingAfterMainMs: getOnboardingCirclesHintDelayMs(0),
  triggerPathsLinkMs: getTriggerPathsLinkDelayMs(copyReveal.delayMs),
  triggerTapHintMs: getTriggerTapHintDelayMs(copyReveal.delayMs),
  returnTapHintMs: getReturnTapHintDelayMs(copyReveal.delayMs),
  returnAfterFollowUpMs: getFlowTapHintDelayMs(getAuxiliaryCopyDelayMs(copyReveal.delayMs)),
  returnAfterBodyMs: getFlowTapHintDelayMs(copyReveal.delayMs),
  actionAfterFeetInstructionMs: getActionSimpleTapHintDelayMs(copyReveal.delayMs),
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
