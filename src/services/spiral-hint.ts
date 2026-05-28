import { countEventsByType, logEvent } from "../data/repositories/events-repo";
import { SpiralHintPresentation, getSpiralHintPresentation } from "../modules/spiral-hint-presentation";
import { bootstrapPulsation } from "./pulsation-flow";

export function recordSpiralTap(screen: string): void {
  bootstrapPulsation();
  logEvent("spiral_tap", { screen });
}

export function getSpiralTapCount(): number {
  bootstrapPulsation();
  return countEventsByType("spiral_tap");
}

export { getSpiralHintPresentation };
export type { SpiralHintPresentation };
