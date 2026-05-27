import { Animated, StyleProp, View, ViewStyle } from "react-native";
import { spiralVisualStyles as styles } from "../spiral-visual";

type Props = {
  style?: StyleProp<ViewStyle>;
  opacity?: Animated.Value | Animated.AnimatedInterpolation<number>;
  scale?: Animated.Value | Animated.AnimatedInterpolation<number>;
};

export function SpiralRings({ style, opacity, scale }: Props) {
  const animatedStyle =
    opacity != null || scale != null
      ? {
          opacity,
          transform: scale != null ? [{ scale }] : undefined,
        }
      : undefined;

  return (
    <Animated.View style={[styles.outer, animatedStyle, style]}>
      <View style={styles.ringXL} />
      <View style={styles.ringL} />
      <View style={styles.ringM} />
      <View style={styles.ringS} />
      <View style={styles.centerDot} />
    </Animated.View>
  );
}
