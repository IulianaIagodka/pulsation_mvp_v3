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
    /** Delay before each next bullet appears when auto-revealing. */
    autoRevealIntervalMs: 2000,
    revealDurationMs: 1200,
  },
  triangleBreath: {
    cycles: 3,
    inhaleMs: 4000,
    holdMs: 2000,
    exhaleMs: 5000,
    labelFadeMs: 600,
  },
  explanationText: {
    fadeMs: 2200,
    textOpacity: 0.58,
    /** Trigger / action first line. */
    primaryDelayMs: 0,
    /** Gap after return “You are here” before follow-up explanation. */
    secondaryDelayMs: 2100,
  },
  motion: {
    screenFadeMs: 450,
    textFadeInMs: 1500,
    textFadeOutMs: 900,
  },
  /** Return copy starts after route fade so it does not overlap action. */
  returnScreen: {
    primaryDelayMs: 650,
  },
} as const;

/** Calm reveal for onboarding “How it works” block (other screens keep `explanationText`). */
export const onboardingRhythm = {
  fadeMs: 1800,
  afterHeadlineMs: 480,
  stepGapMs: 320,
} as const;

function getOnboardingStepGapMs(): number {
  return onboardingRhythm.fadeMs + onboardingRhythm.stepGapMs;
}

function getOnboardingSubtitleDelayMs(): number {
  return breathingRhythm.motion.textFadeInMs + onboardingRhythm.afterHeadlineMs;
}

/** Delay for onboarding subtitle (0) and each step line (1…n). */
export function getOnboardingExplanationDelayMs(lineIndex: number): number {
  const subtitleDelay = getOnboardingSubtitleDelayMs();
  if (lineIndex === 0) {
    return subtitleDelay;
  }
  return subtitleDelay + getOnboardingStepGapMs() * lineIndex;
}

/** Onboarding: “tap the spiral” after all steps (or after headline on short flow). */
export function getOnboardingSpiralHintDelayMs(stepCount: number): number {
  const { fadeMs } = onboardingRhythm;
  const { textFadeInMs } = breathingRhythm.motion;
  const stepGap = getOnboardingStepGapMs();
  const subtitleDelay = getOnboardingSubtitleDelayMs();

  if (stepCount === 0) {
    return textFadeInMs + fadeMs + stepGap;
  }

  const lastStepDelayMs = subtitleDelay + stepGap * stepCount;
  return lastStepDelayMs + fadeMs + stepGap;
}

const flowHintGapMs = 400;

/** Flow screens: hint starts after the last line finishes fading. */
export function getFlowSpiralHintDelayMs(lastLineDelayMs: number): number {
  return lastLineDelayMs + breathingRhythm.explanationText.fadeMs + flowHintGapMs;
}

/** Hint after the last find-three bullet begins appearing. */
export function getFindThreeSpiralHintDelayMs(bulletCount: number): number {
  const intervals = Math.max(0, bulletCount - 1);
  const lastBulletDelayMs =
    getFindThreeIntroDelayMs() + breathingRhythm.findThreeThings.autoRevealIntervalMs * intervals;
  return getFlowSpiralHintDelayMs(lastBulletDelayMs);
}

/** Delay from mount when gated content (e.g. all bullets) just became visible. */
export function getFlowSpiralHintDelayAfterRevealMs(): number {
  return breathingRhythm.explanationText.fadeMs + flowHintGapMs;
}

/** "Tap the spiral" delays — always after other copy on that screen (derive from rhythm). */
export const spiralHintTiming = {
  onboardingAfterMainMs: getOnboardingSpiralHintDelayMs(0),
  triggerAfterPromptMs: getFlowSpiralHintDelayMs(breathingRhythm.explanationText.primaryDelayMs),
  returnAfterFollowUpMs: getFlowSpiralHintDelayMs(
    breathingRhythm.returnScreen.primaryDelayMs + breathingRhythm.explanationText.secondaryDelayMs,
  ),
  returnAfterBodyMs: getFlowSpiralHintDelayMs(breathingRhythm.returnScreen.primaryDelayMs),
  actionAfterFeetInstructionMs: getFlowSpiralHintDelayMs(breathingRhythm.explanationText.primaryDelayMs),
  actionAfterFindThreeMs: getFindThreeSpiralHintDelayMs(3),
} as const;

/** Return screen: "Save this for me" always after the last visible line (hint or follow-up). */
export function getReturnKeepForMeDelayMs(params: {
  spiralHintShows: boolean;
  spiralHintDelayMs: number;
}): number {
  const { fadeMs, secondaryDelayMs } = breathingRhythm.explanationText;
  const { primaryDelayMs } = breathingRhythm.returnScreen;
  const gapAfterFadeMs = 400;
  if (params.spiralHintShows) {
    return params.spiralHintDelayMs + fadeMs + gapAfterFadeMs;
  }
  return primaryDelayMs + secondaryDelayMs + fadeMs + gapAfterFadeMs;
}

export const spiralLayout = {
  size: 136,
  /** Vertical anchor: fraction of content area below safe area (0.5 = true center). */
  anchorRatio: 0.36,
  /** Gap between spiral bottom edge and first scroll text line when no under-spiral hint (px). */
  textGap: 12,
  /** Visual offset: negative pulls hint up under the spiral rings (px). */
  hintOverlap: -22,
  /** Gap from hint bottom to first scroll line (px). */
  hintToContentGap: 52,
  slotMinHeight: 160,
} as const;

/** Static intro visible before find-three bullets begin. */
export function getFindThreeIntroDelayMs(): number {
  const { primaryDelayMs, fadeMs } = breathingRhythm.explanationText;
  return primaryDelayMs + fadeMs + 400;
}

/** Static intro visible before phase labels and spiral triangle rhythm start. */
export function getTriangleBreathIntroDelayMs(): number {
  const { primaryDelayMs, fadeMs } = breathingRhythm.explanationText;
  return primaryDelayMs + fadeMs + 400;
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
