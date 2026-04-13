export const breathingRhythm = {
  spiral: {
    inhaleMs: 1900,
    holdMs: 800,
    exhaleMs: 2100,
  },
  findThreeThings: {
    revealDelayMs: [1800, 7000, 12000] as const,
    revealDurationMs: 1200,
  },
  triangleBreath: {
    fadeDurationMs: 700,
    visibleDurationMs: 3600,
    holdBridgeDelayMs: 5000,
  },
} as const;

export const spiralLayout = {
  slotMinHeight: 160,
} as const;
