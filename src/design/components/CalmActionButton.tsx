import { Pressable, View, StyleSheet } from "react-native";
import { legibleOpacity } from "../accessibility";
import { CalmText } from "./CalmText";
import { colors, spacing } from "../tokens";
import { useHighContrast } from "../../hooks/use-high-contrast";

type Props = {
  label: string;
  onPress: () => void;
};

export function CalmActionButton({ label, onPress }: Props) {
  const highContrast = useHighContrast();
  const linkOpacity = legibleOpacity(1, highContrast, "muted");

  return (
    <Pressable onPress={onPress} hitSlop={10} accessibilityRole="button">
      <View style={styles.link}>
        <CalmText
          style={[
            styles.linkText,
            { opacity: linkOpacity },
            highContrast && styles.linkTextHighContrast,
          ]}
        >
          {label}
        </CalmText>
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
