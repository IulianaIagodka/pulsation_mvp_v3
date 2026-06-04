/** Spiral SVG / layout box (px) — single source for diameter on screen. */
export const SPIRAL_VIEW_SIZE = 160;

/** Path ends almost at the geometric center (no center dot). */
export const SPIRAL_R_MIN = 0.5;

/** Outer spiral start — just inside the view rim. */
export const SPIRAL_R_MAX = SPIRAL_VIEW_SIZE / 2 - 1;

/** Winding pitch for the main body — wider gap between coils. */
export const SPIRAL_RADIAL_PITCH = 13;

/** Below this radius, tighter inner coils. */
export const SPIRAL_INNER_BOUNDARY_R = 16;

export const SPIRAL_INNER_PITCH = 6;

/** Final coils to the center — still tight, but fewer than before. */
export const SPIRAL_CORE_BOUNDARY_R = 5;

export const SPIRAL_CORE_PITCH = 3;

/** Total turns (outer + inner + core). */
export const SPIRAL_TURNS =
  (SPIRAL_R_MAX - SPIRAL_INNER_BOUNDARY_R) / SPIRAL_RADIAL_PITCH +
  (SPIRAL_INNER_BOUNDARY_R - SPIRAL_CORE_BOUNDARY_R) / SPIRAL_INNER_PITCH +
  (SPIRAL_CORE_BOUNDARY_R - SPIRAL_R_MIN) / SPIRAL_CORE_PITCH;

export const SPIRAL_STROKE_WIDTH = 1;
export const SPIRAL_STROKE_WIDTH_HIGH_CONTRAST = 1.05;

/** @deprecated Legacy ring radii — kept for regression docs only. */
export const SPIRAL_RING_RADII = [5, 19, 31, 43, 55] as const;

type SpiralSegment = {
  rOuter: number;
  rInner: number;
  pitch: number;
};

const DEFAULT_SPIRAL_SEGMENTS: SpiralSegment[] = [
  { rOuter: SPIRAL_R_MAX, rInner: SPIRAL_INNER_BOUNDARY_R, pitch: SPIRAL_RADIAL_PITCH },
  { rOuter: SPIRAL_INNER_BOUNDARY_R, rInner: SPIRAL_CORE_BOUNDARY_R, pitch: SPIRAL_INNER_PITCH },
  { rOuter: SPIRAL_CORE_BOUNDARY_R, rInner: SPIRAL_R_MIN, pitch: SPIRAL_CORE_PITCH },
];

type ArchimedeanOptions = {
  cx: number;
  cy: number;
  rMin?: number;
  rMax?: number;
  radialPitch?: number;
  segments?: SpiralSegment[];
  /** Wind from outside toward center (matches preview “long thin”). */
  inward?: boolean;
  startAngle?: number;
  pointsPerTurn?: number;
};

/**
 * Archimedean spiral with constant pitch per segment.
 * Default: outer coils then tighter inner coils to the center.
 */
export function buildArchimedeanSpiralPath({
  cx,
  cy,
  rMin = SPIRAL_R_MIN,
  rMax = SPIRAL_R_MAX,
  radialPitch = SPIRAL_RADIAL_PITCH,
  segments,
  inward = true,
  startAngle = -Math.PI / 2,
  pointsPerTurn = 56,
}: ArchimedeanOptions): string {
  const spiralSegments =
    segments ??
    (rMin === SPIRAL_R_MIN &&
    rMax === SPIRAL_R_MAX &&
    radialPitch === SPIRAL_RADIAL_PITCH
      ? DEFAULT_SPIRAL_SEGMENTS
      : [{ rOuter: rMax, rInner: rMin, pitch: radialPitch }]);

  const points: string[] = [];
  let theta = 0;

  for (const { rOuter, rInner, pitch } of spiralSegments) {
    const span = Math.abs(rOuter - rInner);
    if (span <= 0) continue;

    const b = pitch / (2 * Math.PI);
    const turns = span / pitch;
    const steps = Math.max(2, Math.ceil(turns * pointsPerTurn));
    const deltaTheta = turns * 2 * Math.PI;

    for (let index = points.length === 0 ? 0 : 1; index <= steps; index += 1) {
      const localTheta = (index / steps) * deltaTheta;
      const radius = inward ? rOuter - b * localTheta : rInner + b * localTheta;
      const angle = startAngle + theta + localTheta;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      points.push(`${points.length === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`);
    }

    theta += deltaTheta;
  }

  return points.join("");
}
