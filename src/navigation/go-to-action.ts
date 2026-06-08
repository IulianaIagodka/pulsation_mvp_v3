import type { Router } from "expo-router";
import { armFlowScreenEntryDelay } from "../design/flow-screen-transition";
import { decideIntervention } from "../services/pulsation-flow";
import { useAppStore } from "../state/app-store";
import { matchesAppRoute } from "./route-path";

/** Open the action step directly — e.g. from an inactivity notification tap. */
export function goToAction(router: Router, pathname: string): void {
  if (matchesAppRoute(pathname, "/action")) {
    return;
  }

  useAppStore.getState().setSelectedIntervention(decideIntervention());
  armFlowScreenEntryDelay();

  try {
    router.replace("/action");
  } catch (error) {
    console.warn("[navigation] replace to action failed:", error);
  }
}
