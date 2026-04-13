import { Animated, Easing, StyleSheet, TouchableWithoutFeedback, View } from "react-native";
import { colors } from "../tokens";
import { useEffect, useRef } from "react";
import { breathingRhythm } from "../animation-rhythm";

type Props = { onPress?: () => void };

export function SpiralFocus({ onPress }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.94)).current;
  const { inhaleMs, holdMs, exhaleMs } = breathingRhythm.spiral;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1.06,
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
            toValue: 1.06,
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
            toValue: 1,
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
    loop.start();
    return () => {
      loop.stop();
    };
  }, [opacity, scale]);

  const content = (
    <Animated.View
      style={[
        styles.outer,
        {
          opacity,
          transform: [{ scale }],
        },
      ]}
    >
      <View style={styles.ringXL} />
      <View style={styles.ringL} />
      <View style={styles.ringM} />
      <View style={styles.ringS} />
      <View style={styles.centerDot} />
    </Animated.View>
  );

  if (!onPress) {
    return content;
  }

  return <TouchableWithoutFeedback onPress={onPress}>{content}</TouchableWithoutFeedback>;
}

const styles = StyleSheet.create({
  outer: {
    width: 136,
    height: 136,
    borderRadius: 68,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.spiralRing,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  ringXL: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 1,
    borderColor: colors.spiralRing,
    opacity: 0.55,
  },
  ringL: {
    position: "absolute",
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 1,
    borderColor: colors.spiralRing,
    opacity: 0.58,
  },
  ringM: {
    position: "absolute",
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 1,
    borderColor: colors.spiralRing,
    opacity: 0.62,
  },
  ringS: {
    position: "absolute",
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.spiralRing,
    opacity: 0.65,
  },
  centerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.spiralInner,
    opacity: 0.8,
  },
});
