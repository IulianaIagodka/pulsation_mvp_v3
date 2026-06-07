import { usePathname } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useStableLayoutInsets } from "../../hooks/use-stable-layout-insets";
import { useStableWindowDimensions } from "../../hooks/use-stable-window-dimensions";
import { useAppStore } from "../../state/app-store";
import { circlesLayout } from "../animation-rhythm";
import { getCirclesAnchorMetrics, getUnderCirclesHintSlotHeight } from "../circles-anchor-layout";
import { setCirclesAnimationMode } from "../circles-breath-engine";
import { PersistentCircles } from "./PersistentCircles";
import { CirclesUnderHint } from "./CirclesUnderHint";

function isFlowPath(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname === "/index" ||
    pathname === "/trigger" ||
    pathname === "/action" ||
    pathname === "/return"
  );
}

export function PersistentCirclesLayer() {
  const pathname = usePathname();
  const insets = useStableLayoutInsets();
  const { height: windowHeight, width: windowWidth } = useStableWindowDimensions();
  const selected = useAppStore((s) => s.selectedIntervention);
  const circlesPressHandler = useAppStore((s) => s.circlesPressHandler);
  const circlesHint = useAppStore((s) => s.circlesHint);

  const mode =
    pathname === "/action" && selected === "triangle_breath" ? "triangle" : "calm";

  useEffect(() => {
    setCirclesAnimationMode(mode);
  }, [mode]);

  const metrics = getCirclesAnchorMetrics(windowHeight, insets);
  const circlesTop = insets.top + metrics.circlesCenterY - circlesLayout.size / 2;
  const flowVisible = isFlowPath(pathname);
  const hintSlotHeight = getUnderCirclesHintSlotHeight(windowWidth);

  return (
    <View
      pointerEvents={flowVisible ? "box-none" : "none"}
      style={[
        styles.circlesSlot,
        { top: circlesTop },
        !flowVisible && styles.hidden,
      ]}
    >
      <View style={styles.circlesBlock}>
        <PersistentCircles onPress={flowVisible ? (circlesPressHandler ?? undefined) : undefined} />
        {flowVisible ? (
          circlesHint ? (
            <CirclesUnderHint
              presentation={circlesHint.presentation}
              visible={circlesHint.visible ?? true}
              delayMs={circlesHint.delayMs}
              label={circlesHint.label}
              revealId={circlesHint.revealId}
              forceVisible={circlesHint.forceVisible}
              holdAfterReveal={circlesHint.holdAfterReveal}
              reserveSlot
            />
          ) : (
            <View style={{ minHeight: hintSlotHeight }} />
          )
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hidden: {
    opacity: 0,
  },
  circlesSlot: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 50,
    elevation: 12,
  },
  circlesBlock: {
    alignItems: "center",
    width: "100%",
  },
});
