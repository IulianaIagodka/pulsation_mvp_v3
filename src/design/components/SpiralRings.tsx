import { Animated, StyleProp, View, ViewStyle } from "react-native";
import { spiralVisualStyles as styles } from "../spiral-visual";
import { useHighContrast } from "../../hooks/use-high-contrast";

type Props = {
  style?: StyleProp<ViewStyle>;
  opacity?: Animated.Value | Animated.AnimatedInterpolation<number>;
  scale?: Animated.Value | Animated.AnimatedInterpolation<number>;
};

export function SpiralRings({ style, opacity, scale }: Props) {
  const highContrast = useHighContrast();
  const animatedStyle =
    opacity != null || scale != null
      ? {
          opacity,
          transform: scale != null ? [{ scale }] : undefined,
        }
      : undefined;

  return (
    <Animated.View style={[styles.outer, animatedStyle, style]}>
      <View style={[styles.ringXL, highContrast && styles.ringXLHighContrast]} />
      <View style={[styles.ringL, highContrast && styles.ringLHighContrast]} />
      <View style={[styles.ringM, highContrast && styles.ringMHighContrast]} />
      <View style={[styles.ringS, highContrast && styles.ringSHighContrast]} />
      <View style={[styles.centerDot, highContrast && styles.centerDotHighContrast]} />
    </Animated.View>
  );
}
