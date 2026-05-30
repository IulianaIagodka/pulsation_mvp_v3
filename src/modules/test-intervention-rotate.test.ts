import { ALL_INTERVENTIONS } from "./intervention-planner";
import {
  __testRotateInternals,
  isTestRotateModeEnabled,
  pickNextRotatingIntervention,
} from "./test-intervention-rotate";

describe("test intervention rotate", () => {
  afterEach(() => {
    delete process.env.EXPO_PUBLIC_TEST_ROTATE_INTERVENTIONS;
    __testRotateInternals.resetRotationIndex();
  });

  it("cycles through all interventions in order", () => {
    process.env.EXPO_PUBLIC_TEST_ROTATE_INTERVENTIONS = "true";
    for (const intervention of ALL_INTERVENTIONS) {
      expect(pickNextRotatingIntervention()).toBe(intervention);
    }
    expect(pickNextRotatingIntervention()).toBe(ALL_INTERVENTIONS[0]);
  });

  it("can be disabled explicitly", () => {
    process.env.EXPO_PUBLIC_TEST_ROTATE_INTERVENTIONS = "false";
    expect(isTestRotateModeEnabled()).toBe(false);
  });
});
