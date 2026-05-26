import { PropsWithChildren } from "react";
import { StyleProp, StyleSheet, Text, TextStyle } from "react-native";
import { colors, typography } from "../tokens";

type Props = PropsWithChildren<{ style?: StyleProp<TextStyle> }>;

export function CalmText({ children, style }: Props) {
  return <Text style={[styles.text, style]}>{children}</Text>;
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
