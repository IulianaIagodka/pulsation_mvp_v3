/** Shared circle path builder for icon / App Store scripts (mirrors circle-archimedean-path.ts). */

export const CIRCLE_VIEW_SIZE = 160;
export const CIRCLE_R_MIN = 0.5;
export const CIRCLE_R_MAX = CIRCLE_VIEW_SIZE / 2 - 1;
export const CIRCLE_RADIAL_PITCH = 13;
export const CIRCLE_INNER_BOUNDARY_R = 16;
export const CIRCLE_INNER_PITCH = 6;
export const CIRCLE_CORE_BOUNDARY_R = 6;
export const CIRCLE_CORE_PITCH = 3;

const SEGMENTS = [
  { rOuter: CIRCLE_R_MAX, rInner: CIRCLE_INNER_BOUNDARY_R, pitch: CIRCLE_RADIAL_PITCH },
  { rOuter: CIRCLE_INNER_BOUNDARY_R, rInner: CIRCLE_CORE_BOUNDARY_R, pitch: CIRCLE_INNER_PITCH },
  { rOuter: CIRCLE_CORE_BOUNDARY_R, rInner: CIRCLE_R_MIN, pitch: CIRCLE_CORE_PITCH },
];

export function buildArchimedeanCirclePath(cx, cy, scale = 1, pointsPerTurn = 56) {
  const points = [];
  let theta = 0;
  const startAngle = -Math.PI / 2;

  for (const { rOuter, rInner, pitch } of SEGMENTS) {
    const b = pitch / (2 * Math.PI);
    const turns = (rOuter - rInner) / pitch;
    const steps = Math.max(2, Math.ceil(turns * pointsPerTurn));
    const deltaTheta = turns * 2 * Math.PI;

    for (let index = points.length === 0 ? 0 : 1; index <= steps; index += 1) {
      const localTheta = (index / steps) * deltaTheta;
      const radius = (rOuter - b * localTheta) * scale;
      const angle = startAngle + theta + localTheta;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      const digits = scale === 1 ? 2 : 1;
      points.push(
        (points.length === 0 ? "M" : "L") + x.toFixed(digits) + "," + y.toFixed(digits),
      );
    }
    theta += deltaTheta;
  }

  return points.join("");
}
