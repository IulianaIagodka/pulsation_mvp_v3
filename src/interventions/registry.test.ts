jest.mock("expo-localization", () => ({
  getLocales: () => [{ languageCode: "en" }],
}));

import {
  ALL_INTERVENTIONS,
  INTERVENTION_REGISTRY,
  isSimpleInstruction,
} from "./registry";
import { interventionCopy, interventionGuidance, pickReturnExplanation } from "../modules/delivery-layer";
import { TIME_OF_DAY_POOLS } from "../modules/intervention-planner";

describe("intervention registry", () => {
  it("lists every intervention exactly once", () => {
    const ids = INTERVENTION_REGISTRY.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect([...ids]).toEqual([...ALL_INTERVENTIONS]);
  });

  it("has non-empty copy for every intervention", () => {
    for (const id of ALL_INTERVENTIONS) {
      expect(interventionCopy[id]?.trim().length).toBeGreaterThan(0);
      expect(interventionGuidance[id]?.actionText?.trim().length).toBeGreaterThan(0);
      expect(pickReturnExplanation(id)?.trim().length).toBeGreaterThan(0);
    }
  });

  it("keeps time-of-day pools within the catalog", () => {
    for (const pool of Object.values(TIME_OF_DAY_POOLS)) {
      for (const id of pool) {
        expect(ALL_INTERVENTIONS).toContain(id);
      }
    }
  });

  it("marks five interventions as simple instruction mode", () => {
    const simpleIds = INTERVENTION_REGISTRY.filter((entry) => entry.presentation === "simple").map(
      (entry) => entry.id,
    );
    expect(simpleIds).toHaveLength(5);
    for (const id of simpleIds) {
      expect(isSimpleInstruction(id)).toBe(true);
    }
  });
});
