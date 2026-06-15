import { circlesLayout } from "./animation-rhythm";

export const CIRCLES_PRESS_HIT_SLOP = 12;
export const CIRCLES_LAYER_Z_INDEX = 1000;
export const CIRCLES_LAYER_ELEVATION = 1000;

export type CirclesLayerFrame = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export function getCirclesLayerHitTargetSize(): number {
  return circlesLayout.size + CIRCLES_PRESS_HIT_SLOP * 2;
}

export function getCirclesLayerHitTargetFrame(
  windowWidth: number,
  circlesVisualTop: number,
): CirclesLayerFrame {
  const size = getCirclesLayerHitTargetSize();
  return {
    top: circlesVisualTop - CIRCLES_PRESS_HIT_SLOP,
    left: Math.max(0, Math.round((windowWidth - size) / 2)),
    width: size,
    height: size,
  };
}
