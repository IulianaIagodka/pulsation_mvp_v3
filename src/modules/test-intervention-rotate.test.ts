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
    expect(pickNextRotatingIntervention()).toBe("feet_on_ground");
    expect(pickNextRotatingIntervention()).toBe("find_three_things");
    expect(pickNextRotatingIntervention()).toBe("triangle_breath");
    expect(pickNextRotatingIntervention()).toBe("feet_on_ground");
  });

  it("can be disabled explicitly", () => {
    process.env.EXPO_PUBLIC_TEST_ROTATE_INTERVENTIONS = "false";
    expect(isTestRotateModeEnabled()).toBe(false);
  });
});
