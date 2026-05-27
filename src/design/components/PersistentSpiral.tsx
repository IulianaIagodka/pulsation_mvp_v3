import { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, StyleSheet } from "react-native";
import { breathingRhythm } from "../animation-rhythm";
import { SpiralRings } from "./SpiralRings";

export type SpiralAnimationMode = "calm" | "triangle";

type Props = {
  mode: SpiralAnimationMode;
  onPress?: () => void;
};

/**
 * Single spiral instance — calm loop or triangle breath sequence.
 * Animated values persist across mode switches so the spiral does not “restart” on navigation.
 */
export function PersistentSpiral({ mode, onPress }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.94)).current;
  const runningRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    runningRef.current?.stop();
    runningRef.current = null;

    if (mode === "calm") {
      const { inhaleMs, holdMs, exhaleMs, scaleExhale, scaleInhale } = breathingRhythm.spiral;
      const loop = Animated.loop(
        Animated.sequence([
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
          Animated.parallel([
            Animated.timing(scale, {
              toValue: scaleInhale,
              duration: holdMs,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 1,
              duration: holdMs,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
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
        ]),
      );
      runningRef.current = loop;
      loop.start();
    } else {
      const { inhaleMs, holdMs, exhaleMs, holdAfterExhaleMs } = breathingRhythm.triangleBreath;
      const { scaleExhale, scaleInhale } = breathingRhythm.spiral;
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
      runningRef.current = fullBreath;
      fullBreath.start();
    }

    return () => {
      runningRef.current?.stop();
      runningRef.current = null;
    };
  }, [mode, opacity, scale]);

  const content = <SpiralRings opacity={opacity} scale={scale} />;

  if (!onPress) return content;

  return (
    <Pressable onPress={onPress} style={styles.pressWrap} hitSlop={12} accessibilityRole="button">
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
