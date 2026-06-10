import { PropsWithChildren, useMemo, useRef } from "react";
import { Animated, Easing, StyleProp, StyleSheet, Text, View, ViewStyle, type EasingFunction } from "react-native";
import { useStableWindowDimensions } from "../../hooks/use-stable-window-dimensions";
import { applyCappedFontScale, legibleOpacity } from "../accessibility";
import { breathingRhythm, copyReveal } from "../animation-rhythm";
import { shouldInstantFlowReveal } from "../flow-copy-reveal";
import { useFlowCopyReveal } from "../use-flow-copy-reveal";
import {
  explanationTextStyle,
  getFooterFaintLinkStyle,
  mainCopyTextStyle,
  onboardingDetailTextStyle,
  sectionHeadingTextStyle,
} from "../main-copy";
import { getFlowCopyTextWidth } from "../responsive";
import { colors, spacing } from "../tokens";
import { useHighContrast } from "../../hooks/use-high-contrast";
import { useStableLayoutInsets } from "../../hooks/use-stable-layout-insets";

const EXPLANATION_FADE_EASING = Easing.out(Easing.quad);

type Props = PropsWithChildren<{
  delayMs?: number;
  fadeMs?: number;
  fadeEasing?: EasingFunction;
  style?: StyleProp<ViewStyle>;
  variant?: "main" | "heading" | "explanation" | "hint" | "onboardingDetail";
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
  const { width } = useStableWindowDimensions();
  const insets = useStableLayoutInsets();
  const copyWidth = useMemo(() => getFlowCopyTextWidth(width, insets), [insets, width]);
  const instant = shouldInstantFlowReveal(revealId, forceVisible);
  const opacity = useRef(new Animated.Value(instant ? 1 : 0)).current;

  useFlowCopyReveal({
    opacity,
    delayMs,
    fadeMs,
    fadeEasing,
    holdAfterReveal,
    revealId,
    forceVisible,
  });

  const resolvedTextOpacity = textOpacity ?? breathingRhythm.explanationText.textOpacity;
  const tone = variant === "hint" ? "faint" : "muted";
  const effectiveOpacity = legibleOpacity(resolvedTextOpacity, highContrast, tone);
  const faintLinkStyle = getFooterFaintLinkStyle(highContrast);
  const textStyle =
    variant === "main"
      ? [styles.mainText, highContrast && styles.mainTextHighContrast]
      : variant === "onboardingDetail"
        ? [styles.onboardingDetailText, highContrast && styles.onboardingDetailTextHighContrast]
        : variant === "heading"
          ? [styles.headingText, highContrast && styles.headingTextHighContrast]
          : variant === "hint"
            ? [faintLinkStyle]
            : [styles.text, highContrast && styles.textHighContrast, { opacity: effectiveOpacity }];

  const wrapStyle =
    variant === "hint"
      ? [styles.wrapHint, style]
      : variant === "main" || variant === "heading" || variant === "onboardingDetail"
        ? [styles.wrap, styles.wrapMain, style]
        : [styles.wrap, styles.wrapExplanation, style];

  const widthStyle = {
    width: "100%" as const,
    maxWidth: copyWidth,
    alignSelf: "center" as const,
    minWidth: 0,
  };

  const copy = (
    <Text allowFontScaling={false} style={applyCappedFontScale([textStyle, { width: "100%", flexShrink: 1 }])}>
      {children}
    </Text>
  );

  return (
    <View style={[wrapStyle, widthStyle, style]}>
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
    opacity: 1,
  },
  onboardingDetailText: onboardingDetailTextStyle,
  onboardingDetailTextHighContrast: {
    color: colors.textPrimary,
    opacity: 1,
  },
  headingText: sectionHeadingTextStyle,
  headingTextHighContrast: {
    color: colors.textPrimary,
    opacity: 1,
  },
  text: explanationTextStyle,
  textHighContrast: {
    color: colors.textPrimary,
  },
});
