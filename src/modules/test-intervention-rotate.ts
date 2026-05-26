import { InterventionType } from "../types/domain";

const rotationOrder: InterventionType[] = [
  "feet_on_ground",
  "find_three_things",
  "triangle_breath",
];

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
