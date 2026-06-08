import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { useHighContrast } from "../../hooks/use-high-contrast";
import { copyReveal } from "../animation-rhythm";
import { onboardingHeadlineTextStyle } from "../main-copy";
import { colors, spacing } from "../tokens";
import { CalmText } from "./CalmText";
import { OverflowScrollView } from "./OverflowScrollView";
import { OnboardingHowItWorksSteps, OnboardingHowItWorksSubtitle } from "./OnboardingIntroContent";
import { uiCopy } from "../../modules/delivery-layer";

const FADE_IN_EASING = Easing.out(Easing.quad);

type Props = {
  revealedLineCount: number;
  tapReveal?: boolean;
};

/** Extended onboarding: headline stays visible; tap reveals “How it works” + steps below. */
export function OnboardingPhasedContent({ revealedLineCount, tapReveal = true }: Props) {
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
    <View style={styles.fill}>
      <Animated.View style={[styles.headlineWrap, { opacity: headlineOpacity }]}>
        <CalmText style={headlineStyle}>{uiCopy.onboardingLine}</CalmText>
      </Animated.View>

      {showHowItWorks ? (
        <View style={styles.howItWorksRoot}>
          <View style={styles.subtitleSlot}>
            <OnboardingHowItWorksSubtitle
              phaseRelative
              tapReveal={tapReveal}
              revealedLineCount={revealedLineCount}
            />
          </View>
          <OverflowScrollView
            style={styles.stepsScroll}
            contentContainerStyle={styles.stepsScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <OnboardingHowItWorksSteps
              phaseRelative
              tapReveal={tapReveal}
              revealedLineCount={revealedLineCount}
            />
          </OverflowScrollView>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
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
  howItWorksRoot: {
    flex: 1,
    width: "100%",
    alignSelf: "stretch",
    minWidth: 0,
  },
  subtitleSlot: {
    width: "100%",
    alignSelf: "stretch",
    minWidth: 0,
    paddingTop: spacing.lg,
  },
  stepsScroll: {
    flex: 1,
    width: "100%",
    alignSelf: "stretch",
    minWidth: 0,
    minHeight: 0,
  },
  stepsScrollContent: {
    alignItems: "stretch",
    alignSelf: "stretch",
    width: "100%",
    minWidth: 0,
    paddingBottom: spacing.sm,
  },
  mainText: onboardingHeadlineTextStyle,
  mainTextHighContrast: {
    color: colors.textPrimary,
  },
});
