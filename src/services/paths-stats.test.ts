import { getPathsSnapshot, hasPathsContent } from "./paths-stats";

jest.mock("../data/repositories/outcomes-repo", () => ({
  getOutcomesProfile: () => ({
    keptInterventions: ["relax_jaw", "feet_on_ground"],
  }),
}));

jest.mock("../data/repositories/safety-repo", () => ({
  getSafetyState: () => ({
    interventionsToday: 2,
  }),
}));

describe("getPathsSnapshot", () => {
  it("reads kept interventions and today's count from local stores", () => {
    expect(getPathsSnapshot()).toEqual({
      keptInterventions: ["relax_jaw", "feet_on_ground"],
      actionsToday: 2,
    });
  });
});

describe("hasPathsContent", () => {
  it("is true when there are actions today or saved items", () => {
    expect(hasPathsContent({ keptInterventions: ["relax_jaw"], actionsToday: 0 })).toBe(true);
    expect(hasPathsContent({ keptInterventions: [], actionsToday: 1 })).toBe(true);
  });

  it("is false when there is no stats or saved content", () => {
    expect(hasPathsContent({ keptInterventions: [], actionsToday: 0 })).toBe(false);
  });
});
