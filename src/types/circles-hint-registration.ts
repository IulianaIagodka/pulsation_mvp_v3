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
};
