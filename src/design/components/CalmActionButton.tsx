import { TouchableWithoutFeedback, View, StyleSheet } from "react-native";
import { CalmText } from "./CalmText";
import { colors, spacing } from "../tokens";

type Props = {
  label: string;
  onPress: () => void;
};

export function CalmActionButton({ label, onPress }: Props) {
  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={styles.link}>
        <CalmText style={styles.linkText}>{label}</CalmText>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  link: {
    marginTop: spacing.lg,
    paddingVertical: spacing.xs,
    alignSelf: "center",
    minWidth: 160,
    alignItems: "center",
    justifyContent: "center",
  },
  linkText: { color: colors.textSecondary, fontSize: 15, textAlign: "center" },
});
