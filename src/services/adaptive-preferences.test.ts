import { getOutcomesProfile, saveOutcomesProfile } from "../data/repositories/outcomes-repo";
import {
  hasKeptIntervention,
  markInterventionKept,
  registerExplanationEngagement,
  scoreDwellTimeMs,
} from "./adaptive-preferences";

jest.mock("../data/repositories/outcomes-repo", () => ({
  getOutcomesProfile: jest.fn(),
  saveOutcomesProfile: jest.fn(),
}));

describe("adaptive-preferences", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getOutcomesProfile as jest.Mock).mockReturnValue({
      preferredByHour: {},
      completionRates: {},
      preferenceScores: {},
      keptInterventions: [],
      recentInterventions: [],
    });
  });

  it("remembers kept interventions and does not duplicate entries", () => {
    let profile = {
      preferredByHour: {},
      completionRates: {},
      preferenceScores: {},
      keptInterventions: [] as string[],
      recentInterventions: [],
    };
    (getOutcomesProfile as jest.Mock).mockImplementation(() => profile);
    (saveOutcomesProfile as jest.Mock).mockImplementation((next) => {
      profile = next;
    });

    expect(hasKeptIntervention("relax_jaw")).toBe(false);
    markInterventionKept("relax_jaw");
    expect(hasKeptIntervention("relax_jaw")).toBe(true);
    markInterventionKept("relax_jaw");
    expect(profile.keptInterventions).toEqual(["relax_jaw"]);
  });

  it("scores dwell time tiers", () => {
    expect(scoreDwellTimeMs(11_000)).toBe(3);
    expect(scoreDwellTimeMs(6_000)).toBe(1);
    expect(scoreDwellTimeMs(200)).toBe(-1);
    expect(scoreDwellTimeMs(2_000)).toBe(0);
  });

  it("adds keep-for-me and dwell signals to local score", () => {
    (getOutcomesProfile as jest.Mock).mockReturnValue({
      preferredByHour: {},
      completionRates: {},
      preferenceScores: { relax_jaw: 2 },
      recentInterventions: [],
    });

    const score = registerExplanationEngagement("relax_jaw", {
      keepForMeTapped: true,
      dwellMs: 12_000,
    });

    expect(score).toBe(15);
    expect(saveOutcomesProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        preferenceScores: expect.objectContaining({ relax_jaw: 15 }),
      }),
    );
  });
});
