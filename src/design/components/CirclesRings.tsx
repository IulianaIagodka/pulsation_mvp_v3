import { Animated, StyleProp, View, ViewStyle } from "react-native";
import { circlesVisualStyles as styles } from "../circles-visual";
import { useHighContrast } from "../../hooks/use-high-contrast";

type Props = {
  style?: StyleProp<ViewStyle>;
  opacity?: Animated.Value | Animated.AnimatedInterpolation<number>;
  scale?: Animated.Value | Animated.AnimatedInterpolation<number>;
  highlighted?: boolean;
};

export function CirclesRings({ style, opacity, scale, highlighted = false }: Props) {
  const highContrast = useHighContrast();
  const animatedStyle =
    opacity != null || scale != null
      ? {
          opacity,
          transform: scale != null ? [{ scale }] : undefined,
        }
      : undefined;

  return (
    <Animated.View style={[styles.outer, highlighted && styles.outerHighlighted, animatedStyle, style]}>
      <View
        style={[
          styles.ringXL,
          highContrast && styles.ringXLHighContrast,
          highlighted && styles.ringXLHighlighted,
        ]}
      />
      <View
        style={[
          styles.ringL,
          highContrast && styles.ringLHighContrast,
          highlighted && styles.ringLHighlighted,
        ]}
      />
      <View
        style={[
          styles.ringM,
          highContrast && styles.ringMHighContrast,
          highlighted && styles.ringMHighlighted,
        ]}
      />
      <View
        style={[
          styles.ringS,
          highContrast && styles.ringSHighContrast,
          highlighted && styles.ringSHighlighted,
        ]}
      />
      <View
        style={[
          styles.centerDot,
          highContrast && styles.centerDotHighContrast,
          highlighted && styles.centerDotHighlighted,
        ]}
      />
    </Animated.View>
  );
}
