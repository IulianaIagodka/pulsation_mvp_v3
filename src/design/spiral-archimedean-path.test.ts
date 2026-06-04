import {
  SPIRAL_RADIAL_PITCH,
  SPIRAL_R_MAX,
  SPIRAL_R_MIN,
  SPIRAL_TURNS,
  SPIRAL_VIEW_SIZE,
  buildArchimedeanSpiralPath,
} from "./spiral-archimedean-path";

describe("buildArchimedeanSpiralPath", () => {
  it("uses outer + inner + core coils (no center dot)", () => {
    expect(SPIRAL_VIEW_SIZE).toBe(160);
    expect(SPIRAL_R_MIN).toBe(0.5);
    expect(SPIRAL_R_MAX).toBe(79);
    expect(SPIRAL_RADIAL_PITCH).toBe(13);
    expect(SPIRAL_TURNS).toBeCloseTo(8.18, 1);
  });

  it("ends almost at the center", () => {
    const c = SPIRAL_VIEW_SIZE / 2;
    const path = buildArchimedeanSpiralPath({ cx: c, cy: c });
    const last = path.split("L").pop() ?? "";
    const [, y] = last.split(",").map(Number);
    expect(y).toBeGreaterThan(c - 1);
    expect(y).toBeLessThan(c + 0.5);
  });

  it("starts at the outer top edge and winds inward", () => {
    const c = SPIRAL_VIEW_SIZE / 2;
    const path = buildArchimedeanSpiralPath({ cx: c, cy: c });
    expect(path.startsWith(`M${c.toFixed(2)},1.00`)).toBe(true);
    expect(path).toContain("L");
    expect(path.split("L").length).toBeGreaterThan(200);
  });
});
