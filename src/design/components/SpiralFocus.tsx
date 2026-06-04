import { Animated, Easing, StyleSheet } from "react-native";
import { useEffect, useRef } from "react";
import { breathingRhythm } from "../animation-rhythm";
import { isPressableHighlighted } from "../pressable-highlight";
import { CalmPressable } from "./CalmPressable";
import { SpiralRings } from "./SpiralRings";

type Props = { onPress?: () => void; startDelayMs?: number };

export function SpiralFocus({ onPress, startDelayMs = 0 }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(breathingRhythm.spiral.opacityExhale)).current;
  const {
    inhaleMs,
    holdMs,
    exhaleMs,
    postExhaleHoldMs,
    scaleExhale,
    scaleInhale,
    opacityExhale,
    opacityInhale,
  } = breathingRhythm.spiral;

  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    const startTimer = setTimeout(() => {
      loop = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(scale, {
              toValue: scaleInhale,
              duration: inhaleMs,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: opacityInhale,
              duration: inhaleMs,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(scale, {
              toValue: scaleInhale,
              duration: holdMs,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: opacityInhale,
              duration: holdMs,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(scale, {
              toValue: scaleExhale,
              duration: exhaleMs,
              easing: Easing.in(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: opacityExhale,
              duration: exhaleMs,
              easing: Easing.in(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(scale, {
              toValue: scaleExhale,
              duration: postExhaleHoldMs,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: opacityExhale,
              duration: postExhaleHoldMs,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
          ]),
        ]),
      );
      loop.start();
    }, startDelayMs);

    return () => {
      clearTimeout(startTimer);
      loop?.stop();
    };
  }, [
    exhaleMs,
    holdMs,
    inhaleMs,
    opacity,
    opacityExhale,
    opacityInhale,
    postExhaleHoldMs,
    scale,
    scaleExhale,
    scaleInhale,
    startDelayMs,
  ]);

  if (!onPress) {
    return <SpiralRings opacity={opacity} scale={scale} />;
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
