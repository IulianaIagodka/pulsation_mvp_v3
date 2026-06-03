import { PropsWithChildren, useEffect, useRef } from "react";
import { Animated, Easing, StyleProp, StyleSheet, View, ViewStyle, type EasingFunction } from "react-native";
import { legibleOpacity } from "../accessibility";
import { breathingRhythm, copyReveal } from "../animation-rhythm";
import { mainCopyTextStyle, spiralHintTextStyle } from "../main-copy";
import { colors, spacing } from "../tokens";
import { useHighContrast } from "../../hooks/use-high-contrast";
import { CalmText } from "./CalmText";

const EXPLANATION_FADE_EASING = Easing.out(Easing.quad);

type Props = PropsWithChildren<{
  delayMs?: number;
  /** Defaults to `breathingRhythm.explanationText.fadeMs`. */
  fadeMs?: number;
  /** Defaults to `Easing.out(Easing.quad)`. */
  fadeEasing?: EasingFunction;
  style?: StyleProp<ViewStyle>;
  variant?: "main" | "explanation" | "hint";
  textOpacity?: number;
  /** Skip fade restart on parent re-renders — stay visible after first reveal. */
  holdAfterReveal?: boolean;
}>;

/**
 * Soft copy reveal: main lines match onboarding tone; explanation stays quieter.
 */
export function ExplanationText({
  children,
  delayMs = copyReveal.delayMs,
  fadeMs = copyReveal.fadeMs,
  fadeEasing = EXPLANATION_FADE_EASING,
  style,
  variant = "explanation",
  textOpacity,
  holdAfterReveal = false,
}: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const hasRevealedRef = useRef(false);
  const fadeEasingRef = useRef(fadeEasing);
  fadeEasingRef.current = fadeEasing;
  const highContrast = useHighContrast();

  useEffect(() => {
    if (holdAfterReveal && hasRevealedRef.current) {
      opacity.setValue(1);
      return;
    }

    let cancelled = false;
    opacity.setValue(0);

    const timer = setTimeout(() => {
      if (cancelled) return;
      Animated.timing(opacity, {
        toValue: 1,
        duration: fadeMs,
        easing: fadeEasingRef.current,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished && !cancelled) {
          hasRevealedRef.current = true;
        }
      });
    }, delayMs);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (!holdAfterReveal || !hasRevealedRef.current) {
        opacity.stopAnimation();
      }
    };
  }, [delayMs, fadeMs, holdAfterReveal, opacity]);

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
    marginTop: 0,
    paddingTop: 0,
    paddingBottom: 0,
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
