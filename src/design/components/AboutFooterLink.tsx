import { TouchableWithoutFeedback, View, StyleSheet } from "react-native";
import { CalmText } from "./CalmText";
import { colors, spacing } from "../tokens";

type Props = {
  label: string;
  onPress: () => void;
};

export function AboutFooterLink({ label, onPress }: Props) {
  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={styles.wrap}>
        <CalmText style={styles.text}>{label}</CalmText>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  text: {
    color: colors.textSecondary,
    opacity: 0.7,
    fontSize: 14,
    letterSpacing: 0.35,
    textAlign: "center",
    textDecorationLine: "underline",
  },
});
