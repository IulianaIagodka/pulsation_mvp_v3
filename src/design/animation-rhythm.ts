export const breathingRhythm = {
  spiral: {
    inhaleMs: 1900,
    holdMs: 800,
    exhaleMs: 2100,
    scaleExhale: 1,
    scaleInhale: 1.12,
    haloScaleExhale: 1,
    haloScaleInhale: 1.15,
  },
  findThreeThings: {
    revealDelayMs: [1800, 7000, 12000] as const,
    revealDurationMs: 1200,
    /** Pause after last line + hint before auto-advance to return (~7s after hint). */
    pauseBeforeAdvanceMs: 7000,
  },
  triangleBreath: {
    cycles: 3,
    inhaleMs: 4000,
    holdMs: 2000,
    exhaleMs: 5000,
    holdAfterExhaleMs: 2000,
    labelFadeMs: 600,
  },
  explanationText: {
    fadeMs: 2200,
    textOpacity: 0.52,
    /** Trigger / action first line. */
    primaryDelayMs: 0,
    /** Gap after return “You are here” before follow-up explanation. */
    secondaryDelayMs: 2500,
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
  actionAutoComplete: {
    feetOnGroundMs: 7000,
    /** After 3 breath cycles: time to show "tap the spiral" before auto-advance. */
    triangleBreathExtraMs: 3200,
  },
} as const;

/** "Tap the spiral" delays — always after other copy on that screen (derive from rhythm). */
export const spiralHintTiming = {
  onboardingAfterMainMs: breathingRhythm.motion.textFadeInMs + 250,
  triggerAfterPromptMs: breathingRhythm.explanationText.fadeMs + 400,
  returnAfterFollowUpMs:
    breathingRhythm.returnScreen.primaryDelayMs +
    breathingRhythm.explanationText.secondaryDelayMs +
    breathingRhythm.explanationText.fadeMs +
    400,
  actionAfterFeetInstructionMs: breathingRhythm.explanationText.fadeMs + 400,
  actionAfterFindThreeMs:
    breathingRhythm.findThreeThings.revealDelayMs[2] + breathingRhythm.explanationText.fadeMs + 400,
} as const;

export const spiralLayout = {
  size: 136,
  /** Vertical anchor: fraction of content area below safe area (0.5 = true center). */
  anchorRatio: 0.36,
  /** Gap between spiral bottom edge and first text line (px). */
  textGap: 12,
  slotMinHeight: 160,
} as const;

export function getTriangleBreathSpiralCycleMs(): number {
  const { inhaleMs, holdMs, exhaleMs, holdAfterExhaleMs } = breathingRhythm.triangleBreath;
  return inhaleMs + holdMs + exhaleMs + holdAfterExhaleMs;
}

export function getTriangleBreathLabelCycleMs(): number {
  const { inhaleMs, holdMs, exhaleMs, holdAfterExhaleMs, labelFadeMs } = breathingRhythm.triangleBreath;
  const fade = labelFadeMs;
  const phaseVisible = (phaseMs: number) => Math.max(0, phaseMs - fade * 2);
  return (
    fade * 8 +
    phaseVisible(inhaleMs) +
    phaseVisible(holdMs) +
    phaseVisible(exhaleMs) +
    phaseVisible(holdAfterExhaleMs)
  );
}

export function getTriangleBreathTotalMs(): number {
  const { cycles } = breathingRhythm.triangleBreath;
  return getTriangleBreathLabelCycleMs() * cycles;
}
