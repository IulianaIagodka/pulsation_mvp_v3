import {
  CIRCLE_RADIAL_PITCH,
  CIRCLE_R_MAX,
  CIRCLE_R_MIN,
  CIRCLE_TURNS,
  CIRCLE_VIEW_SIZE,
  buildArchimedeanCirclePath,
} from "./circle-archimedean-path";

describe("buildArchimedeanCirclePath", () => {
  it("keeps layout constants stable", () => {
    expect(CIRCLE_VIEW_SIZE).toBe(160);
    expect(CIRCLE_R_MIN).toBe(0.5);
    expect(CIRCLE_R_MAX).toBe(79);
    expect(CIRCLE_RADIAL_PITCH).toBe(13);
    expect(CIRCLE_TURNS).toBeCloseTo(8.18, 1);
  });

  it("starts with M and contains L segments", () => {
    const c = CIRCLE_VIEW_SIZE / 2;
    const path = buildArchimedeanCirclePath({ cx: c, cy: c });
    expect(path.startsWith("M")).toBe(true);
    expect(path.includes("L")).toBe(true);
    expect(path.length).toBeGreaterThan(100);
  });

  it("winds inward toward center", () => {
    const c = CIRCLE_VIEW_SIZE / 2;
    const path = buildArchimedeanCirclePath({ cx: c, cy: c });
    const coords = path.match(/-?\d+\.\d+/g)?.map(Number) ?? [];
    const radii = [];
    for (let i = 0; i < coords.length; i += 2) {
      const dx = coords[i] - c;
      const dy = coords[i + 1] - c;
      radii.push(Math.hypot(dx, dy));
    }
    expect(radii[0]).toBeGreaterThan(radii[radii.length - 1]);
  });
});
