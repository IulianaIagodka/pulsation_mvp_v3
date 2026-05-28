import { PropsWithChildren, useEffect, useRef } from "react";
import { Animated, Easing, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { breathingRhythm } from "../animation-rhythm";
import { mainCopyTextStyle } from "../main-copy";
import { colors } from "../tokens";
import { CalmText } from "./CalmText";

type Props = PropsWithChildren<{
  delayMs?: number;
  style?: StyleProp<ViewStyle>;
  variant?: "main" | "explanation";
  textOpacity?: number;
}>;

/**
 * Soft copy reveal: main lines match onboarding tone; explanation stays quieter.
 */
export function ExplanationText({
  children,
  delayMs = 0,
  style,
  variant = "explanation",
  textOpacity,
}: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const { fadeMs } = breathingRhythm.explanationText;

  useEffect(() => {
    opacity.setValue(0);
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 1,
        duration: fadeMs,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    }, delayMs);

    return () => clearTimeout(timer);
  }, [children, delayMs, fadeMs, opacity]);

  const resolvedTextOpacity = textOpacity ?? breathingRhythm.explanationText.textOpacity;
  const textStyle = variant === "main" ? styles.mainText : [styles.text, { opacity: resolvedTextOpacity }];

  return (
    <View style={[styles.wrap, style]}>
      <Animated.View style={[styles.inner, { opacity }]}>
        <CalmText style={textStyle}>{children}</CalmText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    alignSelf: "stretch",
    alignItems: "center",
    minHeight: 48,
    justifyContent: "center",
  },
  inner: {
    width: "100%",
    alignSelf: "stretch",
  },
  mainText: mainCopyTextStyle,
  text: {
    color: colors.textSecondary,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 20,
    letterSpacing: 0.15,
    width: "100%",
    maxWidth: "100%",
    flexShrink: 1,
  },
});
