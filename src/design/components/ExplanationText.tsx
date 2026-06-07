import { PropsWithChildren, ReactNode, useRef } from "react";
import { Animated, Easing, PixelRatio, StyleProp, StyleSheet, View, ViewStyle, useWindowDimensions, type EasingFunction } from "react-native";
import { legibleOpacity } from "../accessibility";
import { breathingRhythm, copyReveal } from "../animation-rhythm";
import { shouldInstantFlowReveal } from "../flow-copy-reveal";
import { useFlowCopyReveal } from "../use-flow-copy-reveal";
import { mainCopyTextStyle, tapHintTextStyle } from "../main-copy";
import { getMainCopySlotHeight } from "../circles-anchor-layout";
import { colors, spacing } from "../tokens";
import { useHighContrast } from "../../hooks/use-high-contrast";
import { CalmText } from "./CalmText";

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
  const { width: windowWidth } = useWindowDimensions();
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

  const resolvedTextOpacity = textOpacity ?? breathingRhythm.explanationText.textOpacity;
  const tone = variant === "hint" ? "hint" : "muted";
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
        ? [
            styles.wrap,
            styles.wrapMain,
            { minHeight: getMainCopySlotHeight(windowWidth, PixelRatio.getFontScale()) },
            style,
          ]
        : [styles.wrap, style];

  if (instant) {
    return (
      <View style={wrapStyle}>
        <CalmText style={textStyle}>{children}</CalmText>
      </View>
    );
  }

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
  /** Stable slot while main line fades in (avoids equator re-center jump). */
  wrapMain: {
    justifyContent: "flex-start",
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
  hintText: tapHintTextStyle,
  hintTextHighContrast: {
    color: colors.textPrimary,
    opacity: 0.82,
  },
});
