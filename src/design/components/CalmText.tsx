import { PropsWithChildren } from "react";
import { StyleProp, StyleSheet, Text, TextProps, TextStyle } from "react-native";
import { colors, typography } from "../tokens";
import { useHighContrast } from "../../hooks/use-high-contrast";

type Props = PropsWithChildren<TextProps & { style?: StyleProp<TextStyle> }>;

export function CalmText({ children, style, ...rest }: Props) {
  const highContrast = useHighContrast();

  return (
    <Text
      allowFontScaling
      maxFontSizeMultiplier={1.6}
      style={[styles.text, style, highContrast && styles.textHighContrast]}
      {...rest}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: "400",
    textAlign: "center",
    width: "100%",
    maxWidth: "100%",
    flexShrink: 1,
  },
  textHighContrast: {
    color: colors.textPrimary,
    opacity: 0.98,
  },
});
