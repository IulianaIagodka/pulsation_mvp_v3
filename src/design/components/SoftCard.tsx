import { PropsWithChildren } from "react";
import { StyleSheet, View, useWindowDimensions, type StyleProp, type ViewStyle } from "react-native";
import { spacing } from "../tokens";
import { getContentMaxWidth, scaleByWidth } from "../responsive";

type Props = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
}>;

export function SoftCard({ children, style }: Props) {
  const { height, width } = useWindowDimensions();
  const isCompactHeight = height < 740;
  return (
    <View
      style={[
        styles.card,
        { maxWidth: getContentMaxWidth(width), padding: scaleByWidth(spacing.lg, width) },
        isCompactHeight && styles.cardCompact,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    alignSelf: "center",
    alignItems: "center",
    borderRadius: 0,
    backgroundColor: "transparent",
  },
  cardCompact: {
    padding: spacing.md,
  },
});
