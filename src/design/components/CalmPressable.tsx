import { useCallback, useState } from "react";
import {
  Platform,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { type CalmPressableVisualState } from "../pressable-highlight";

const calmPressableWebCursor: ViewStyle =
  Platform.OS === "web" ? ({ cursor: "pointer" } as ViewStyle) : {};

type Props = Omit<PressableProps, "children" | "style"> & {
  children: React.ReactNode | ((state: CalmPressableVisualState) => React.ReactNode);
  style?: StyleProp<ViewStyle> | ((state: CalmPressableVisualState) => StyleProp<ViewStyle>);
};

/** Tracks hover/press/focus for a brief brighten on links, icons, and the spiral. */
export function CalmPressable({
  children,
  style,
  onHoverIn,
  onHoverOut,
  onPressIn,
  onPressOut,
  onFocus,
  onBlur,
  ...rest
}: Props) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [focused, setFocused] = useState(false);

  const visualState: CalmPressableVisualState = { hovered, pressed, focused };

  const resolveStyle = useCallback(
    (state: CalmPressableVisualState): StyleProp<ViewStyle> => {
      const baseStyle = typeof style === "function" ? style(state) : style;
      return [baseStyle, calmPressableWebCursor];
    },
    [style],
  );

  return (
    <Pressable
      {...rest}
      onHoverIn={(event) => {
        setHovered(true);
        onHoverIn?.(event);
      }}
      onHoverOut={(event) => {
        setHovered(false);
        onHoverOut?.(event);
      }}
      onPressIn={(event) => {
        setPressed(true);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        setPressed(false);
        onPressOut?.(event);
      }}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      style={resolveStyle(visualState)}
    >
      {typeof children === "function" ? children(visualState) : children}
    </Pressable>
  );
}
