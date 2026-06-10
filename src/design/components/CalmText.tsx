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
  }
>;

export function CalmText({ children, style, ...rest }: Props) {
  const highContrast = useHighContrast();
  const { width } = useStableWindowDimensions();
  const insets = useStableLayoutInsets();
  const copyWidth = useMemo(() => getFlowCopyTextWidth(width, insets), [insets, width]);
  const scaledStyle = applyCappedFontScale([styles.text, { width: "100%", flexShrink: 1 }, style, highContrast && styles.textHighContrast]);

  return (
    <View style={[styles.widthWrap, { maxWidth: copyWidth }]}>
      <Text allowFontScaling={false} style={scaledStyle} {...rest}>
        {children}
      </Text>
    </View>
  );
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
