import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { isPressableHighlighted } from "../pressable-highlight";
import { getSpiralBreathValues, resumeCalmLoopAfterViewMount } from "../spiral-breath-engine";
import { CalmPressable } from "./CalmPressable";
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

  const rings = <SpiralRings opacity={opacity} scale={scale} />;

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
      {(state) => (
        <SpiralRings
          opacity={opacity}
          scale={scale}
          highlighted={isPressableHighlighted(state)}
        />
      )}
    </CalmPressable>
  );
}

const styles = StyleSheet.create({
  pressWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
});
