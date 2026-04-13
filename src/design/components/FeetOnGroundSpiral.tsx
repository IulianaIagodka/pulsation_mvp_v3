import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, TouchableWithoutFeedback, View } from "react-native";
import { colors } from "../tokens";
import { breathingRhythm } from "../animation-rhythm";

type Props = { onPress?: () => void };

export function FeetOnGroundSpiral({ onPress }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.94)).current;
  const { inhaleMs, holdMs, exhaleMs } = breathingRhythm.spiral;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        // Inhale: gentle expansion and subtle brightening.
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
        // Hold: almost still, no visual jump.
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
        // Exhale: soft contraction with tiny downward settling.
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
    return () => loop.stop();
  }, [opacity, scale]);

  const content = (
    <View style={styles.wrap}>
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
    </View>
  );

  if (!onPress) return content;
  return <TouchableWithoutFeedback onPress={onPress}>{content}</TouchableWithoutFeedback>;
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
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
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
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
