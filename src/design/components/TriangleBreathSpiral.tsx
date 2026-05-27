import { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, StyleSheet } from "react-native";
import { breathingRhythm } from "../animation-rhythm";
import { SpiralRings } from "./SpiralRings";

type Props = { onPress?: () => void; onComplete?: () => void };

export function TriangleBreathSpiral({ onPress, onComplete }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.94)).current;
  const { inhaleMs, holdMs, exhaleMs, holdAfterExhaleMs } = breathingRhythm.triangleBreath;
  const { scaleExhale, scaleInhale } = breathingRhythm.spiral;

  useEffect(() => {
    const oneCycle = Animated.sequence([
      Animated.parallel([
        Animated.timing(scale, {
          toValue: scaleInhale,
          duration: inhaleMs,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: inhaleMs,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(holdMs),
      Animated.parallel([
        Animated.timing(scale, {
          toValue: scaleExhale,
          duration: exhaleMs,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.94,
          duration: exhaleMs,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(holdAfterExhaleMs),
    ]);

    const fullBreath = Animated.sequence(
      Array.from({ length: breathingRhythm.triangleBreath.cycles }, () => oneCycle),
    );

    fullBreath.start(({ finished }) => {
      if (finished) onComplete?.();
    });
    return () => fullBreath.stop();
  }, [exhaleMs, holdAfterExhaleMs, holdMs, inhaleMs, onComplete, opacity, scale, scaleExhale, scaleInhale]);

  const content = <SpiralRings opacity={opacity} scale={scale} />;

  if (!onPress) return content;
  return (
    <Pressable
      onPress={onPress}
      style={styles.pressWrap}
      hitSlop={12}
      accessibilityRole="button"
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
});
