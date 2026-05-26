import { PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { colors, spacing } from "../tokens";

type Props = PropsWithChildren<{ centered?: boolean }>;

export function CalmScreen({ children, centered = false }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={[colors.backgroundSecondary, colors.backgroundPrimary, "#060C17"]}
        start={{ x: 0.12, y: 0.06 }}
        end={{ x: 0.9, y: 0.96 }}
        style={styles.gradient}
      >
        <View style={styles.overlay}>
          <Svg width="100%" height="100%">
            <Defs>
              <RadialGradient id="vignette" cx="50%" cy="42%" r="72%">
                <Stop offset="0%" stopColor="#000000" stopOpacity="0" />
                <Stop offset="55%" stopColor="#000000" stopOpacity="0.04" />
                <Stop offset="100%" stopColor="#000000" stopOpacity="0.42" />
              </RadialGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#vignette)" />
          </Svg>
        </View>
        <View style={[styles.container, centered && styles.centered]}>{children}</View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.backgroundPrimary },
  gradient: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject },
  container: { flex: 1, padding: spacing.lg },
  centered: { justifyContent: "center", alignItems: "center" },
});
