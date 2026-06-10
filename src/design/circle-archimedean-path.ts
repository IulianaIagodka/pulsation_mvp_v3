/** Circle SVG / layout box (px) — single source for diameter on screen. */
export const CIRCLE_VIEW_SIZE = 160;

/** Path ends almost at the geometric center (no center dot). */
export const CIRCLE_R_MIN = 0.5;

/** Outer circle start — just inside the view rim. */
export const CIRCLE_R_MAX = CIRCLE_VIEW_SIZE / 2 - 1;

/** Winding pitch for the main body — wider gap between coils. */
export const CIRCLE_RADIAL_PITCH = 13;

/** Below this radius, tighter inner coils. */
export const CIRCLE_INNER_BOUNDARY_R = 16;

export const CIRCLE_INNER_PITCH = 6;

/** Final coils to the center — still tight, but fewer than before. */
export const CIRCLE_CORE_BOUNDARY_R = 5;

export const CIRCLE_CORE_PITCH = 3;

/** Total turns (outer + inner + core). */
export const CIRCLE_TURNS =
  (CIRCLE_R_MAX - CIRCLE_INNER_BOUNDARY_R) / CIRCLE_RADIAL_PITCH +
  (CIRCLE_INNER_BOUNDARY_R - CIRCLE_CORE_BOUNDARY_R) / CIRCLE_INNER_PITCH +
  (CIRCLE_CORE_BOUNDARY_R - CIRCLE_R_MIN) / CIRCLE_CORE_PITCH;

export const CIRCLE_STROKE_WIDTH = 1;
export const CIRCLE_STROKE_WIDTH_HIGH_CONTRAST = 1.05;


type CircleSegment = {
  rOuter: number;
  rInner: number;
  pitch: number;
};

const DEFAULT_CIRCLE_SEGMENTS: CircleSegment[] = [
  { rOuter: CIRCLE_R_MAX, rInner: CIRCLE_INNER_BOUNDARY_R, pitch: CIRCLE_RADIAL_PITCH },
  { rOuter: CIRCLE_INNER_BOUNDARY_R, rInner: CIRCLE_CORE_BOUNDARY_R, pitch: CIRCLE_INNER_PITCH },
  { rOuter: CIRCLE_CORE_BOUNDARY_R, rInner: CIRCLE_R_MIN, pitch: CIRCLE_CORE_PITCH },
];

type ArchimedeanOptions = {
  cx: number;
  cy: number;
  rMin?: number;
  rMax?: number;
  radialPitch?: number;
  segments?: CircleSegment[];
  /** Wind from outside toward center (matches preview “long thin”). */
  inward?: boolean;
  startAngle?: number;
  pointsPerTurn?: number;
};

/**
 * Archimedean circle path with constant pitch per segment.
 * Default: outer coils then tighter inner coils to the center.
 */
export function buildArchimedeanCirclePath({
  cx,
  cy,
  rMin = CIRCLE_R_MIN,
  rMax = CIRCLE_R_MAX,
  radialPitch = CIRCLE_RADIAL_PITCH,
  segments,
  inward = true,
  startAngle = -Math.PI / 2,
  pointsPerTurn = 56,
}: ArchimedeanOptions): string {
  const circleSegments =
    segments ??
    (rMin === CIRCLE_R_MIN &&
    rMax === CIRCLE_R_MAX &&
    radialPitch === CIRCLE_RADIAL_PITCH
      ? DEFAULT_CIRCLE_SEGMENTS
      : [{ rOuter: rMax, rInner: rMin, pitch: radialPitch }]);

  const points: string[] = [];
  let theta = 0;

  for (const { rOuter, rInner, pitch } of circleSegments) {
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
