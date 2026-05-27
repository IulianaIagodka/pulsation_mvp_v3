import { PropsWithChildren } from "react";
import { StyleProp, StyleSheet, Text, TextProps, TextStyle } from "react-native";
import { colors, typography } from "../tokens";

type Props = PropsWithChildren<TextProps & { style?: StyleProp<TextStyle> }>;

export function CalmText({ children, style, ...rest }: Props) {
  return (
    <Text style={[styles.text, style]} {...rest}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    color: colors.textPrimary,
    fontSize: typography.body,
    lineHeight: 26,
    fontWeight: "400",
    textAlign: "center",
  },
});
