import { StyleSheet } from "react-native";
import { legibleOpacity } from "../accessibility";
import { resolvePressableTextOpacity } from "../pressable-highlight";
import { CalmPressable } from "./CalmPressable";
import { CalmText } from "./CalmText";
import { colors, spacing } from "../tokens";
import { useHighContrast } from "../../hooks/use-high-contrast";

type Props = {
  label: string;
  onPress: () => void;
};

export function CalmActionButton({ label, onPress }: Props) {
  const highContrast = useHighContrast();
  const linkOpacity = legibleOpacity(0.72, highContrast, "muted");
  const linkOpacityActive = legibleOpacity(0.92, highContrast, "hint");

  return (
    <CalmPressable onPress={onPress} hitSlop={10} accessibilityRole="button" style={styles.link}>
      {(state) => (
        <CalmText
          style={[
            styles.linkText,
            highContrast && styles.linkTextHighContrast,
            { opacity: resolvePressableTextOpacity(linkOpacity, linkOpacityActive, state) },
          ]}
        >
          {label}
        </CalmText>
      )}
    </CalmPressable>
  );
}

const styles = StyleSheet.create({
  link: {
    marginTop: spacing.lg,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    alignSelf: "center",
    minWidth: 160,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
  },
  linkText: { color: colors.textSecondary, fontSize: 15, textAlign: "center" },
  linkTextHighContrast: { color: colors.textPrimary },
});
