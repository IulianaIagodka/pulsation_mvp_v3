import { usePathname } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useStableLayoutInsets } from "../../hooks/use-stable-layout-insets";
import { useStableWindowDimensions } from "../../hooks/use-stable-window-dimensions";
import { useAppStore } from "../../state/app-store";
import { spiralLayout } from "../animation-rhythm";
import { getSpiralAnchorMetrics } from "../spiral-anchor-layout";
import { setSpiralAnimationMode } from "../spiral-breath-engine";
import { PersistentSpiral } from "./PersistentSpiral";

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
  const insets = useStableLayoutInsets();
  const { height: windowHeight } = useStableWindowDimensions();
  const selected = useAppStore((s) => s.selectedIntervention);
  const spiralPressHandler = useAppStore((s) => s.spiralPressHandler);

  const mode =
    pathname === "/action" && selected === "triangle_breath" ? "triangle" : "calm";

  useEffect(() => {
    setSpiralAnimationMode(mode);
  }, [mode]);

  const metrics = getSpiralAnchorMetrics(windowHeight, insets);
  const spiralTop = insets.top + metrics.spiralCenterY - spiralLayout.size / 2;
  const flowVisible = isFlowPath(pathname);

  return (
    <View
      pointerEvents={flowVisible ? "box-none" : "none"}
      style={[
        styles.spiralSlot,
        { top: spiralTop },
        !flowVisible && styles.hidden,
      ]}
    >
      <PersistentSpiral onPress={flowVisible ? (spiralPressHandler ?? undefined) : undefined} />
    </View>
  );
}

const styles = StyleSheet.create({
  hidden: {
    opacity: 0,
  },
  spiralSlot: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 50,
    elevation: 12,
  },
});
