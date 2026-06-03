import { legibleOpacity } from "./accessibility";

describe("legibleOpacity", () => {
  it("raises faint copy above a readable floor", () => {
    expect(legibleOpacity(0.55, false, "faint")).toBe(0.62);
    expect(legibleOpacity(0.3, false, "hint")).toBe(0.58);
  });

  it("boosts further in high-contrast mode", () => {
    expect(legibleOpacity(0.55, true, "faint")).toBe(0.85);
    expect(legibleOpacity(0.4, true, "hint")).toBe(0.88);
  });
});
