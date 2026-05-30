import {
  TIME_OF_DAY_POOLS,
  getTimeOfDayPreference,
  planIntervention,
} from "./intervention-planner";
import { InterpretedState } from "./state-interpreter";

const baseState: InterpretedState = {
  hour: 12,
  completionRates: {
    feet_on_ground: 0.9,
    find_three_things: 0.6,
    triangle_breath: 0.4,
    relax_jaw: 0.5,
    drop_shoulders: 0.5,
    notice_three_sounds: 0.5,
    press_palms_together: 0.5,
  },
  recentInterventions: [],
  signalWeight: 0.5,
};

describe("getTimeOfDayPreference", () => {
  it("prefers grounding actions in the morning", () => {
    const pick = getTimeOfDayPreference(8, () => 0.1);
    expect(TIME_OF_DAY_POOLS.morning).toContain(pick);
  });

  it("prefers sensory awareness during the day", () => {
    const pick = getTimeOfDayPreference(14, () => 0.1);
    expect(TIME_OF_DAY_POOLS.daytime).toContain(pick);
  });

  it("prefers breathing and calm body in the evening", () => {
    const pick = getTimeOfDayPreference(19, () => 0.1);
    expect(TIME_OF_DAY_POOLS.evening).toContain(pick);
  });

  it("offers quieter options at night", () => {
    const pick = getTimeOfDayPreference(23, () => 0.1);
    expect(TIME_OF_DAY_POOLS.night).toContain(pick);
  });
});

describe("planIntervention", () => {
  it("avoids repeating the last two actions", () => {
    const state: InterpretedState = {
      ...baseState,
      recentInterventions: ["feet_on_ground", "find_three_things"],
    };
    const pick = planIntervention(state, { random: () => 0.9 });
    expect(pick).not.toBe("feet_on_ground");
    expect(pick).not.toBe("find_three_things");
  });

  it("follows time-of-day preference when random allows", () => {
    const morning: InterpretedState = { ...baseState, hour: 7 };
    const pick = planIntervention(morning, { random: () => 0.2 });
    expect(TIME_OF_DAY_POOLS.morning).toContain(pick);
  });

  it("occasionally suggests a less-used action for variety", () => {
    const pick = planIntervention(baseState, { random: () => 0.05 });
    expect(pick).toBe("triangle_breath");
  });

  it("prefers learned hour preference over generic sorting", () => {
    const state: InterpretedState = {
      ...baseState,
      hour: 12,
      preferredByHour: "triangle_breath",
    };
    const pick = planIntervention(state, { random: () => 0.9 });
    expect(pick).toBe("triangle_breath");
  });
});
