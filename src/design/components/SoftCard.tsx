import { PropsWithChildren } from "react";
import { StyleSheet, View, useWindowDimensions, type StyleProp, type ViewStyle } from "react-native";
import { spacing } from "../tokens";

type Props = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
}>;

export function SoftCard({ children, style }: Props) {
  const { height } = useWindowDimensions();
  const isCompactHeight = height < 740;
  return <View style={[styles.card, isCompactHeight && styles.cardCompact, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    alignItems: "center",
    borderRadius: 0,
    backgroundColor: "transparent",
    padding: spacing.lg,
  },
  cardCompact: {
    padding: spacing.md,
  },
});
