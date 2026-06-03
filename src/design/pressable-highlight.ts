import { Platform, type ViewStyle } from "react-native";

export type CalmPressableVisualState = {
  hovered: boolean;
  pressed: boolean;
  focused: boolean;
};

/** Text/icon opacity on hover, focus, and press — no background fill. */
export function resolvePressableTextOpacity(
  idle: number,
  active: number,
  state: Pick<CalmPressableVisualState, "hovered" | "focused" | "pressed">,
): number {
  if (state.pressed) return Math.min(1, active + 0.06);
  if (state.hovered || state.focused) return active;
  return idle;
}

export const calmPressableWebCursor: ViewStyle =
  Platform.OS === "web" ? ({ cursor: "pointer" } as ViewStyle) : {};
