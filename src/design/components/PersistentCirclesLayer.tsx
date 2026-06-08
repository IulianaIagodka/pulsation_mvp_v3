import { usePathname } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useStableLayoutInsets } from "../../hooks/use-stable-layout-insets";
import { useStableWindowDimensions } from "../../hooks/use-stable-window-dimensions";
import { useAppStore } from "../../state/app-store";
import { circlesLayout } from "../animation-rhythm";
import {
  getCirclesAnchorMetrics,
  getUnderCirclesHintBlockHeight,
} from "../circles-anchor-layout";
import { setCirclesAnimationMode } from "../circles-breath-engine";
import { PersistentCircles } from "./PersistentCircles";
import { CirclesUnderHint } from "./CirclesUnderHint";
import type { CirclesHintRegistration } from "../../types/circles-hint-registration";

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
  const [stickyHint, setStickyHint] = useState<CirclesHintRegistration | null>(null);

  useEffect(() => {
    if (circlesHint) {
      setStickyHint(circlesHint);
      return;
    }
    setStickyHint(null);
  }, [circlesHint]);

  const renderedHint = circlesHint ?? stickyHint;

  const mode =
    pathname === "/action" && selected === "triangle_breath" ? "triangle" : "calm";

  useEffect(() => {
    setCirclesAnimationMode(mode);
  }, [mode]);

  const metrics = getCirclesAnchorMetrics(windowHeight, insets);
  const circlesTop = insets.top + metrics.circlesCenterY - circlesLayout.size / 2;
  const flowVisible = isFlowPath(pathname);
  const hintBlockHeight = getUnderCirclesHintBlockHeight(windowWidth);

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
          renderedHint ? (
            <CirclesUnderHint
              presentation={renderedHint.presentation}
              visible={renderedHint.visible ?? true}
              delayMs={renderedHint.delayMs}
              fadeMs={renderedHint.fadeMs}
              label={renderedHint.label}
              revealId={renderedHint.revealId}
              forceVisible={renderedHint.forceVisible}
              holdAfterReveal={renderedHint.holdAfterReveal}
              labelTransitionMs={renderedHint.labelTransitionMs}
              fadeOutDelayMs={renderedHint.fadeOutDelayMs}
              reserveSlot
            />
          ) : (
            <View style={{ minHeight: hintBlockHeight }} />
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
