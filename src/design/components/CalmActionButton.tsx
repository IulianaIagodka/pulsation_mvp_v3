import { Pressable, View, StyleSheet } from "react-native";
import { CalmText } from "./CalmText";
import { colors, spacing } from "../tokens";
import { useHighContrast } from "../../hooks/use-high-contrast";

type Props = {
  label: string;
  onPress: () => void;
};

export function CalmActionButton({ label, onPress }: Props) {
  const highContrast = useHighContrast();

  return (
    <Pressable onPress={onPress} hitSlop={10} accessibilityRole="button">
      <View style={styles.link}>
        <CalmText style={[styles.linkText, highContrast && styles.linkTextHighContrast]}>{label}</CalmText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: {
    marginTop: spacing.lg,
    paddingVertical: spacing.xs,
    alignSelf: "center",
    minWidth: 160,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  linkText: { color: colors.textSecondary, fontSize: 15, textAlign: "center" },
  linkTextHighContrast: { color: colors.textPrimary },
});
