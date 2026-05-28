import { PropsWithChildren } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { colors, spacing } from "../tokens";

type Props = PropsWithChildren<{
  centered?: boolean;
  /** No inner padding — full-bleed layout (anchored spiral screens). */
  flush?: boolean;
}>;

export function CalmScreen({ children, centered = false, flush = false }: Props) {
  const { width } = useWindowDimensions();
  const horizontalPadding = Math.round(Math.max(spacing.md, Math.min(spacing.xl, width * 0.06)));

  return (
    <SafeAreaView style={styles.safe} edges={flush ? ["top", "left", "right"] : undefined}>
      <LinearGradient
        colors={[colors.backgroundSecondary, colors.backgroundPrimary, "#081021"]}
        start={{ x: 0.12, y: 0.06 }}
        end={{ x: 0.9, y: 0.96 }}
        style={styles.gradient}
      >
        <View style={styles.overlay}>
          <Svg width="100%" height="100%">
            <Defs>
              <RadialGradient id="vignette" cx="50%" cy="42%" r="72%">
                <Stop offset="0%" stopColor="#000000" stopOpacity="0" />
                <Stop offset="55%" stopColor="#000000" stopOpacity="0.02" />
                <Stop offset="100%" stopColor="#000000" stopOpacity="0.28" />
              </RadialGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#vignette)" />
          </Svg>
        </View>
        <View
          style={[
            styles.container,
            { paddingHorizontal: horizontalPadding },
            flush && styles.containerFlush,
            centered && styles.centered,
          ]}
        >
          {children}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.backgroundPrimary },
  gradient: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject },
  container: { flex: 1, paddingVertical: spacing.lg },
  containerFlush: { padding: 0 },
  centered: { justifyContent: "center", alignItems: "center" },
});
