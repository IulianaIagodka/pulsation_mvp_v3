import { Pressable, View, StyleSheet } from "react-native";
import { CalmText } from "./CalmText";
import { colors, spacing } from "../tokens";
import { useHighContrast } from "../../hooks/use-high-contrast";

type Props = {
  label: string;
  onPress: () => void;
};

export function AboutFooterLink({ label, onPress }: Props) {
  const highContrast = useHighContrast();

  return (
    <Pressable onPress={onPress} hitSlop={10} accessibilityRole="button">
      <View style={styles.wrap}>
        <CalmText style={[styles.text, highContrast && styles.textHighContrast]}>{label}</CalmText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 44,
    justifyContent: "center",
  },
  text: {
    color: colors.textSecondary,
    opacity: 0.7,
    fontSize: 14,
    letterSpacing: 0.35,
    textAlign: "center",
    textDecorationLine: "underline",
  },
  textHighContrast: {
    color: colors.textPrimary,
    opacity: 0.96,
  },
});
