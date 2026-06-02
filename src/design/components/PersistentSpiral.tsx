import { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, StyleSheet } from "react-native";
import { breathingRhythm, getTriangleBreathIntroDelayMs } from "../animation-rhythm";
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
  const opacity = useRef(new Animated.Value(breathingRhythm.spiral.opacityExhale)).current;
  const runningRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    runningRef.current?.stop();
    runningRef.current = null;

    if (mode === "calm") {
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
      const loop = Animated.loop(
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
      runningRef.current = loop;
      loop.start();
    } else {
      const { inhaleMs, holdMs, exhaleMs } = breathingRhythm.triangleBreath;
      const { scaleExhale, scaleInhale, opacityExhale, opacityInhale } = breathingRhythm.spiral;
      const oneCycle = Animated.sequence([
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
        Animated.delay(holdMs),
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
      ]);
      const fullBreath = Animated.sequence(
        Array.from({ length: breathingRhythm.triangleBreath.cycles }, () => oneCycle),
      );
      const introDelayMs = getTriangleBreathIntroDelayMs();
      const startId = setTimeout(() => {
        runningRef.current = fullBreath;
        fullBreath.start();
      }, introDelayMs);

      return () => {
        clearTimeout(startId);
        runningRef.current?.stop();
        runningRef.current = null;
      };
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
