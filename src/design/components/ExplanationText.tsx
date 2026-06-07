import { PropsWithChildren, useRef } from "react";
import { Animated, Easing, StyleProp, StyleSheet, Text, View, ViewStyle, type EasingFunction } from "react-native";
import { applyCappedFontScale, legibleOpacity } from "../accessibility";
import { breathingRhythm, copyReveal } from "../animation-rhythm";
import { shouldInstantFlowReveal } from "../flow-copy-reveal";
import { useFlowCopyReveal } from "../use-flow-copy-reveal";
import { explanationTextStyle, mainCopyTextStyle, tapHintTextStyle } from "../main-copy";
import { colors, spacing } from "../tokens";
import { useHighContrast } from "../../hooks/use-high-contrast";

const EXPLANATION_FADE_EASING = Easing.out(Easing.quad);

type Props = PropsWithChildren<{
  delayMs?: number;
  fadeMs?: number;
  fadeEasing?: EasingFunction;
  style?: StyleProp<ViewStyle>;
  variant?: "main" | "explanation" | "hint";
  textOpacity?: number;
  holdAfterReveal?: boolean;
  revealId?: string;
  forceVisible?: boolean;
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
  revealId,
  forceVisible = false,
}: Props) {
  const highContrast = useHighContrast();
  const instant = shouldInstantFlowReveal(revealId, forceVisible);
  const opacity = useRef(new Animated.Value(instant ? 1 : 0)).current;

  useFlowCopyReveal({
    opacity,
    delayMs,
    fadeMs,
    fadeEasing,
    holdAfterReveal,
    revealId,
    forceVisible: instant,
  });

  const resolvedTextOpacity =
    variant === "hint"
      ? (textOpacity ?? 0.48)
      : (textOpacity ?? breathingRhythm.explanationText.textOpacity);
  const tone = variant === "hint" ? "faint" : "muted";
  const effectiveOpacity = legibleOpacity(resolvedTextOpacity, highContrast, tone);
  const textStyle =
    variant === "main"
      ? [styles.mainText, highContrast && styles.mainTextHighContrast]
      : variant === "hint"
        ? [styles.hintText, highContrast && styles.hintTextHighContrast, { opacity: effectiveOpacity }]
        : [styles.text, highContrast && styles.textHighContrast, { opacity: effectiveOpacity }];

  const wrapStyle =
    variant === "hint"
      ? [styles.wrapHint, style]
      : variant === "main"
        ? [styles.wrap, styles.wrapMain, style]
        : [styles.wrap, styles.wrapExplanation, style];

  const copy = (
    <Text allowFontScaling={false} style={applyCappedFontScale(textStyle)}>
      {children}
    </Text>
  );

  if (instant) {
    return <View style={wrapStyle}>{copy}</View>;
  }

  return (
    <View style={wrapStyle}>
      <Animated.View style={[styles.inner, { opacity }]}>{copy}</Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 0,
  },
  /** Stable slot while main line fades in (avoids equator re-center jump). */
  wrapMain: {
    justifyContent: "flex-start",
    alignItems: "stretch",
    minWidth: 0,
  },
  wrapExplanation: {
    alignItems: "stretch",
    justifyContent: "flex-start",
    alignSelf: "stretch",
    width: "100%",
    minWidth: 0,
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
    minWidth: 0,
  },
  mainText: mainCopyTextStyle,
  mainTextHighContrast: {
    color: colors.textPrimary,
  },
  text: explanationTextStyle,
  textHighContrast: {
    color: colors.textPrimary,
  },
  hintText: tapHintTextStyle,
  hintTextHighContrast: {
    color: colors.textPrimary,
  },
});
