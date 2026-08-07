import { PropsWithChildren, useMemo } from "react";
import { StyleProp, StyleSheet, Text, TextProps, TextStyle, View } from "react-native";
import { useStableWindowDimensions } from "../../hooks/use-stable-window-dimensions";
import { applyCappedFontScale } from "../accessibility";
import { appFontFamily } from "../app-font";
import { getFlowCopyTextWidth } from "../responsive";
import { colors, typography } from "../tokens";
import { useHighContrast } from "../../hooks/use-high-contrast";
import { useStableLayoutInsets } from "../../hooks/use-stable-layout-insets";

type Props = PropsWithChildren<
  TextProps & {
    style?: StyleProp<TextStyle>;
    /**
     * When true (default), wrap text to the flow-copy max width used on centered screens.
     * Set false for inline row layouts (e.g. paths saved item + remove icon) so the wrap
     * does not reserve a fixed width beside sibling controls.
     */
    flowWidth?: boolean;
  }
>;

export function CalmText({ children, style, flowWidth = true, ...rest }: Props) {
  const highContrast = useHighContrast();
  const { width } = useStableWindowDimensions();
  const insets = useStableLayoutInsets();
  const copyWidth = useMemo(() => getFlowCopyTextWidth(width, insets), [insets, width]);
  const scaledStyle = applyCappedFontScale([
    styles.text,
    flowWidth && { width: "100%", flexShrink: 1 },
    style,
    highContrast && styles.textHighContrast,
  ]);

  const text = (
    <Text allowFontScaling={false} style={scaledStyle} {...rest}>
      {children}
    </Text>
  );

  if (!flowWidth) {
    return text;
  }

  return <View style={[styles.widthWrap, { maxWidth: copyWidth }]}>{text}</View>;
}

const styles = StyleSheet.create({
  widthWrap: {
    width: "100%",
    alignSelf: "center",
    minWidth: 0,
  },
  text: {
    fontFamily: appFontFamily,
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: "400",
    textAlign: "center",
    width: "100%",
    maxWidth: "100%",
  },
  textHighContrast: {
    color: colors.textPrimary,
    opacity: 0.98,
  },
});
