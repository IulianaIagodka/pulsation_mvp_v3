import { usePathname } from "expo-router";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppStore } from "../../state/app-store";
import { spiralLayout } from "../animation-rhythm";
import { PersistentSpiral, SpiralAnimationMode } from "./PersistentSpiral";

function isFlowPath(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname === "/index" ||
    pathname === "/trigger" ||
    pathname === "/action" ||
    pathname === "/return"
  );
}

export function PersistentSpiralLayer() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const selected = useAppStore((s) => s.selectedIntervention);
  const spiralPressHandler = useAppStore((s) => s.spiralPressHandler);

  if (!isFlowPath(pathname)) {
    return null;
  }

  const contentHeight = windowHeight - insets.top - insets.bottom;
  const spiralTop = insets.top + contentHeight * spiralLayout.anchorRatio - spiralLayout.size / 2;

  const mode: SpiralAnimationMode =
    pathname === "/action" && selected === "triangle_breath" ? "triangle" : "calm";

  return (
    <View pointerEvents="box-none" style={styles.overlay}>
      <View pointerEvents="box-none" style={[styles.spiralSlot, { top: spiralTop }]}>
        <PersistentSpiral mode={mode} onPress={spiralPressHandler ?? undefined} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    elevation: 12,
  },
  spiralSlot: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
});
