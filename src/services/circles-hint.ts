import { logEvent } from "../data/repositories/events-repo";
import { CirclesHintPresentation, getCirclesHintPresentation } from "../modules/circles-hint-presentation";
import { bootstrapPulsation } from "./pulsation-flow";

export function recordCirclesTap(screen: string): void {
  bootstrapPulsation();
  logEvent("circles_tap", { screen });
}

export { getCirclesHintPresentation };
export type { CirclesHintPresentation };
