import { useEffect } from "react";
import { Pressable, StyleSheet } from "react-native";
import { getSpiralBreathValues, resumeCalmLoopAfterViewMount } from "../spiral-breath-engine";
import { SpiralRings } from "./SpiralRings";

type Props = {
  onPress?: () => void;
};

/** Renders the shared spiral motion — animation lives in `spiral-breath-engine`. */
export function PersistentSpiral({ onPress }: Props) {
  const { scale, opacity } = getSpiralBreathValues();

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      resumeCalmLoopAfterViewMount();
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={styles.pressWrap}
      hitSlop={12}
      accessibilityRole={onPress ? "button" : undefined}
    >
      <SpiralRings opacity={opacity} scale={scale} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
});
