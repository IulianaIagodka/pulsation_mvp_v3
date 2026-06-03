import { PropsWithChildren, useEffect, useRef } from "react";
import { Animated, Easing, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { legibleOpacity } from "../accessibility";
import { breathingRhythm } from "../animation-rhythm";
import { mainCopyTextStyle, spiralHintTextStyle } from "../main-copy";
import { colors, spacing } from "../tokens";
import { useHighContrast } from "../../hooks/use-high-contrast";
import { CalmText } from "./CalmText";

type Props = PropsWithChildren<{
  delayMs?: number;
  style?: StyleProp<ViewStyle>;
  variant?: "main" | "explanation" | "hint";
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
  const highContrast = useHighContrast();

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
  const tone = variant === "hint" ? "hint" : "muted";
  const effectiveOpacity = legibleOpacity(resolvedTextOpacity, highContrast, tone);
  const textStyle =
    variant === "main"
      ? [styles.mainText, highContrast && styles.mainTextHighContrast]
      : variant === "hint"
        ? [styles.hintText, highContrast && styles.hintTextHighContrast, { opacity: effectiveOpacity }]
        : [styles.text, highContrast && styles.textHighContrast, { opacity: effectiveOpacity }];

  const wrapStyle = variant === "hint" ? [styles.wrapHint, style] : [styles.wrap, style];

  return (
    <View style={wrapStyle}>
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
    justifyContent: "center",
  },
  wrapHint: {
    width: "100%",
    alignSelf: "stretch",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
  },
  inner: {
    width: "100%",
    alignSelf: "stretch",
  },
  mainText: mainCopyTextStyle,
  mainTextHighContrast: {
    color: colors.textPrimary,
  },
  text: {
    color: colors.textSecondary,
    textAlign: "center",
    fontSize: 13,
    letterSpacing: 0.15,
    width: "100%",
    maxWidth: "100%",
    flexShrink: 1,
  },
  textHighContrast: {
    color: colors.textPrimary,
  },
  hintText: spiralHintTextStyle,
  hintTextHighContrast: {
    color: colors.textPrimary,
    opacity: 0.82,
  },
});
