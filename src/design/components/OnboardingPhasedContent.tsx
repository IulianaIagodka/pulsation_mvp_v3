import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { useHighContrast } from "../../hooks/use-high-contrast";
import { copyReveal } from "../animation-rhythm";
import { onboardingHeadlineTextStyle } from "../main-copy";
import { colors, spacing } from "../tokens";
import { CalmText } from "./CalmText";
import { OnboardingHowItWorksSteps, OnboardingHowItWorksSubtitle } from "./OnboardingIntroContent";
import { uiCopy } from "../../modules/delivery-layer";

const FADE_IN_EASING = Easing.out(Easing.quad);

type Props = {
  revealedLineCount: number;
  tapReveal?: boolean;
  /** Tap on circles — every how-it-works line at once, shared smooth fade. */
  tapBurstReveal?: boolean;
};

/** Extended onboarding: headline stays visible; tap reveals “How it works” + steps below. */
export function OnboardingPhasedContent({
  revealedLineCount,
  tapReveal = true,
  tapBurstReveal = false,
}: Props) {
  const highContrast = useHighContrast();
  const headlineOpacity = useRef(new Animated.Value(0)).current;
  const headlineAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const showHowItWorks = revealedLineCount > 0;
  const headlineStyle = [styles.mainText, highContrast && styles.mainTextHighContrast];

  useEffect(() => {
    headlineOpacity.setValue(0);

    const animation = Animated.sequence([
      Animated.delay(copyReveal.delayMs),
      Animated.timing(headlineOpacity, {
        toValue: 1,
        duration: copyReveal.fadeMs,
        easing: FADE_IN_EASING,
        useNativeDriver: true,
      }),
    ]);
    headlineAnimationRef.current = animation;

    animation.start();

    return () => {
      headlineAnimationRef.current?.stop();
      headlineAnimationRef.current = null;
      headlineOpacity.stopAnimation();
    };
  }, [headlineOpacity]);

  return (
    <View style={styles.content}>
      <Animated.View
        style={[
          styles.headlineWrap,
          showHowItWorks && styles.headlineWrapWithBelow,
          { opacity: headlineOpacity },
        ]}
      >
        <CalmText style={headlineStyle}>{uiCopy.onboardingLine}</CalmText>
      </Animated.View>

      {showHowItWorks ? (
        <View style={styles.howItWorksRoot}>
          <OnboardingHowItWorksSubtitle
            phaseRelative
            tapReveal={tapReveal}
            tapBurstReveal={tapBurstReveal}
            revealedLineCount={revealedLineCount}
          />
          <OnboardingHowItWorksSteps
            phaseRelative
            tapReveal={tapReveal}
            tapBurstReveal={tapBurstReveal}
            revealedLineCount={revealedLineCount}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    width: "100%",
    alignSelf: "stretch",
    minWidth: 0,
  },
  headlineWrap: {
    width: "100%",
    alignSelf: "stretch",
    minWidth: 0,
    paddingHorizontal: spacing.xs,
  },
  headlineWrapWithBelow: {
    marginBottom: spacing.sm,
  },
  howItWorksRoot: {
    width: "100%",
    alignSelf: "stretch",
    minWidth: 0,
    paddingTop: spacing.xl,
  },
  mainText: onboardingHeadlineTextStyle,
  mainTextHighContrast: {
    color: colors.textPrimary,
    opacity: 1,
  },
});
