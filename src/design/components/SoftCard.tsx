import { PropsWithChildren } from "react";
import { StyleSheet, View, useWindowDimensions, type StyleProp, type ViewStyle } from "react-native";
import { spacing } from "../tokens";
import { getContentMaxWidth, scaleByWidth } from "../responsive";

type Props = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  /** Flow main/explanation copy — no card padding or max-width cap. */
  flush?: boolean;
}>;

export function SoftCard({ children, style, flush = false }: Props) {
  const { height, width } = useWindowDimensions();
  const isCompactHeight = height < 740;
  return (
    <View
      style={[
        styles.card,
        flush
          ? styles.cardFlush
          : [
              { maxWidth: getContentMaxWidth(width), padding: scaleByWidth(spacing.lg, width) },
              isCompactHeight && styles.cardCompact,
            ],
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
    minWidth: 0,
    borderRadius: 0,
    backgroundColor: "transparent",
  },
  cardFlush: {
    alignSelf: "stretch",
    alignItems: "stretch",
    maxWidth: "100%",
    padding: 0,
  },
  cardCompact: {
    padding: spacing.md,
  },
});
