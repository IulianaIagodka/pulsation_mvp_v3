export type CalmPressableVisualState = {
  hovered: boolean;
  pressed: boolean;
  focused: boolean;
};

const HOVER_GLOW_LIFT = 0.12;
const PRESS_GLOW_EXTRA = 0.05;

export function isPressableHighlighted(
  state: Pick<CalmPressableVisualState, "hovered" | "focused" | "pressed">,
): boolean {
  return state.pressed || state.hovered || state.focused;
}

/** Text/icon opacity on hover, focus, and press — brief brighten, no background fill. */
export function resolvePressableTextOpacity(
  idle: number,
  active: number,
  state: Pick<CalmPressableVisualState, "hovered" | "focused" | "pressed">,
): number {
  if (!isPressableHighlighted(state)) return idle;
  const glow = Math.min(1, active + HOVER_GLOW_LIFT);
  if (state.pressed) return Math.min(1, glow + PRESS_GLOW_EXTRA);
  return glow;
}
