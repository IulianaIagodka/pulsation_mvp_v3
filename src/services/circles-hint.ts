import { logEvent } from "../data/repositories/events-repo";
import { bootstrapPulsation } from "./pulsation-flow";

export function recordCirclesTap(screen: string): void {
  bootstrapPulsation();
  logEvent("circles_tap", { screen });
}
