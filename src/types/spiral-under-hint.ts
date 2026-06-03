import type { SpiralHintPresentation } from "../modules/spiral-hint-presentation";

export type SpiralUnderHintSlot = {
  presentation: SpiralHintPresentation;
  delayMs?: number;
  visible?: boolean;
  label?: string;
};
