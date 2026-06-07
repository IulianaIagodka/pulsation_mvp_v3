import { StyleSheet } from "react-native";
import { legibleOpacity } from "../accessibility";
import { resolvePressableTextOpacity } from "../pressable-highlight";
import { CalmPressable } from "./CalmPressable";
import { CalmText } from "./CalmText";
import { footerLinkTextStyle } from "../main-copy";
import { colors, spacing } from "../tokens";
import { useHighContrast } from "../../hooks/use-high-contrast";

type Props = {
  label: string;
  onPress: () => void;
};

export function CalmActionButton({ label, onPress }: Props) {
  const highContrast = useHighContrast();
  const linkOpacity = legibleOpacity(0.48, highContrast, "faint");
  const linkOpacityActive = legibleOpacity(0.65, highContrast, "faint");

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
    paddingVertical: 4,
    paddingHorizontal: spacing.md,
    alignSelf: "center",
    minWidth: 120,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
  },
  linkText: footerLinkTextStyle,
  linkTextHighContrast: { color: colors.textPrimary },
});
