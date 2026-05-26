import { PropsWithChildren } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { colors, spacing } from "../tokens";

export function SoftCard({ children }: PropsWithChildren) {
  const { height } = useWindowDimensions();
  const isCompactHeight = height < 740;
  return <View style={[styles.card, isCompactHeight && styles.cardCompact]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    borderRadius: 0,
    backgroundColor: "transparent",
    padding: spacing.lg,
  },
  cardCompact: {
    padding: spacing.md,
  },
});
