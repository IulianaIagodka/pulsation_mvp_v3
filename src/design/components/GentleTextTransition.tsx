import { PropsWithChildren, useEffect, useRef } from "react";
import { Animated, Easing, StyleProp, StyleSheet, ViewStyle } from "react-native";

type Props = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  delayMs?: number;
  durationMs?: number;
}>;

/**
 * Subtle text entrance to keep attention shifts calm and continuous.
 * Opacity-only so layout stays fixed after the fade completes.
 */
export function GentleTextTransition({
  children,
  style,
  delayMs = 80,
  durationMs = 1500,
}: Props) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const sequence = Animated.sequence([
      Animated.delay(delayMs),
      Animated.timing(opacity, {
        toValue: 1,
        duration: durationMs,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    sequence.start();
    return () => sequence.stop();
  }, [delayMs, durationMs, opacity]);

  return <Animated.View style={[styles.container, style, { opacity }]}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignSelf: "stretch",
    alignItems: "stretch",
  },
});
