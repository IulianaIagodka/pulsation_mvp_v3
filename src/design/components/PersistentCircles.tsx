import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { getCirclesBreathValues, resumeCalmLoopAfterViewMount } from "../circles-breath-engine";
import { CalmPressable } from "./CalmPressable";
import { CirclesRings } from "./CirclesRings";

type Props = {
  onPress?: () => void;
};

/** Renders the shared circles motion — animation lives in `circles-breath-engine`. */
export function PersistentCircles({ onPress }: Props) {
  const { scale, opacity } = getCirclesBreathValues();

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      resumeCalmLoopAfterViewMount();
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const rings = <CirclesRings opacity={opacity} scale={scale} />;

  if (!onPress) {
    return <View style={styles.pressWrap}>{rings}</View>;
  }

  return (
    <CalmPressable
      onPress={onPress}
      style={styles.pressWrap}
      hitSlop={12}
      accessibilityRole="button"
    >
      <CirclesRings opacity={opacity} scale={scale} />
    </CalmPressable>
  );
}

const styles = StyleSheet.create({
  pressWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
});
