import { usePathname } from "expo-router";
import { useEffect } from "react";
import { PixelRatio, StyleSheet, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppStore } from "../../state/app-store";
import { spiralLayout } from "../animation-rhythm";
import {
  getSpiralAnchorMetrics,
  getSpiralHintLineHeight,
  getSpiralHintTopY,
} from "../spiral-anchor-layout";
import { setSpiralAnimationMode } from "../spiral-breath-engine";
import { spacing } from "../tokens";
import { PersistentSpiral } from "./PersistentSpiral";
import { SpiralUnderHint } from "./SpiralUnderHint";

function isFlowPath(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname === "/index" ||
    pathname === "/trigger" ||
    pathname === "/action" ||
    pathname === "/return"
  );
}

function isUnderSpiralHintPath(pathname: string): boolean {
  return pathname === "/trigger" || pathname === "/action" || pathname === "/return";
}

export function PersistentSpiralLayer() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const selected = useAppStore((s) => s.selectedIntervention);
  const spiralPressHandler = useAppStore((s) => s.spiralPressHandler);
  const hintSlot = useAppStore((s) => s.spiralUnderHint);

  const mode =
    pathname === "/action" && selected === "triangle_breath" ? "triangle" : "calm";

  useEffect(() => {
    setSpiralAnimationMode(mode);
  }, [mode]);

  const metrics = getSpiralAnchorMetrics(windowHeight, insets);
  const spiralTop = insets.top + metrics.spiralCenterY - spiralLayout.size / 2;
  const hintTop = insets.top + getSpiralHintTopY(metrics, windowWidth);
  const hintLineHeight = getSpiralHintLineHeight(windowWidth, PixelRatio.getFontScale());
  const showHint =
    isFlowPath(pathname) &&
    isUnderSpiralHintPath(pathname) &&
    hintSlot &&
    (hintSlot.visible ?? true) &&
    hintSlot.presentation.shouldShow;
  const flowVisible = isFlowPath(pathname);

  return (
    <View
      pointerEvents={flowVisible ? "box-none" : "none"}
      style={[styles.overlay, !flowVisible && styles.hidden]}
    >
      <View pointerEvents="box-none" style={[styles.spiralSlot, { top: spiralTop }]}>
        <PersistentSpiral onPress={flowVisible ? (spiralPressHandler ?? undefined) : undefined} />
      </View>
      {showHint ? (
        <View
          pointerEvents="none"
          style={[styles.hintSlot, { top: hintTop, minHeight: hintLineHeight }]}
        >
          <SpiralUnderHint
            presentation={hintSlot.presentation}
            delayMs={hintSlot.delayMs}
            label={hintSlot.label}
            visible
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    elevation: 12,
  },
  hidden: {
    opacity: 0,
  },
  spiralSlot: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  hintSlot: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    zIndex: 2,
    elevation: 14,
  },
});
