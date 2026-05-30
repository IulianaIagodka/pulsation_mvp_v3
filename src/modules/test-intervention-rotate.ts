import { ALL_INTERVENTIONS } from "./intervention-planner";
import { InterventionType } from "../types/domain";

const rotationOrder: InterventionType[] = [...ALL_INTERVENTIONS];

let rotationIndex = 0;

export function isTestRotateModeEnabled() {
  const raw = process.env.EXPO_PUBLIC_TEST_ROTATE_INTERVENTIONS;
  if (raw === "true") return true;
  if (raw === "false") return false;
  return typeof __DEV__ !== "undefined" && __DEV__;
}

export function pickNextRotatingIntervention(): InterventionType {
  const picked = rotationOrder[rotationIndex % rotationOrder.length];
  rotationIndex += 1;
  return picked;
}

export const __testRotateInternals = {
  resetRotationIndex() {
    rotationIndex = 0;
  },
};
