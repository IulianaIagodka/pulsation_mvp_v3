import { getPathsSnapshot } from "./paths-stats";

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
