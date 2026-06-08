import type { CirclesHintPresentation } from "../modules/circles-hint-presentation";

export type CirclesHintRegistration = {
  presentation: CirclesHintPresentation;
  visible?: boolean;
  delayMs?: number;
  fadeMs?: number;
  label?: string;
  revealId?: string;
  forceVisible?: boolean;
  holdAfterReveal?: boolean;
  /** Crossfade duration when the label changes while the hint is already visible. */
  labelTransitionMs?: number;
  /** Fade the hint out after this delay from mount (onboarding exit). */
  fadeOutDelayMs?: number;
};
