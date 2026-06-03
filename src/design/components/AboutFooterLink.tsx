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
  disabled?: boolean;
  onHoverIn?: () => void;
  onHoverOut?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
};

export function AboutFooterLink({
  label,
  onPress,
  disabled = false,
  onHoverIn,
  onHoverOut,
  onFocus,
  onBlur,
}: Props) {
  const highContrast = useHighContrast();
  const linkOpacity = legibleOpacity(0.48, highContrast, "faint");
  const linkOpacityActive = legibleOpacity(0.72, highContrast, "muted");

  return (
    <CalmPressable
      onPress={onPress}
      disabled={disabled}
      onHoverIn={onHoverIn}
      onHoverOut={onHoverOut}
      onFocus={onFocus}
      onBlur={onBlur}
      hitSlop={10}
      accessibilityRole="button"
      style={styles.wrap}
    >
      {(state) => (
        <CalmText
          style={[
            styles.text,
            highContrast && styles.textHighContrast,
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
  wrap: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    minHeight: 44,
    justifyContent: "center",
    borderRadius: 22,
  },
  text: {
    color: colors.textSecondary,
    fontSize: 12,
    letterSpacing: 0.25,
    textAlign: "center",
  },
  textHighContrast: {
    color: colors.textPrimary,
  },
});
