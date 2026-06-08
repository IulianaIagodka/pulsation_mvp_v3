import { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { useHighContrast } from "../../hooks/use-high-contrast";
import {
  copyReveal,
  getOnboardingHeadlineFadeOutMs,
  getOnboardingHeadlineHoldMs,
} from "../animation-rhythm";
import { mainCopyTextStyle } from "../main-copy";
import { colors, spacing } from "../tokens";
import { CalmText } from "./CalmText";
import { OverflowScrollView } from "./OverflowScrollView";
import { OnboardingHowItWorksSteps, OnboardingHowItWorksSubtitle } from "./OnboardingIntroContent";
import { uiCopy } from "../../modules/delivery-layer";

const FADE_IN_EASING = Easing.out(Easing.quad);
const FADE_OUT_EASING = Easing.in(Easing.quad);

type Props = {
  revealedLineCount: number;
  tapReveal?: boolean;
  /** Increment to skip the headline and open “How it works”. */
  headlineSkipRequest?: number;
  onHeadlinePhaseComplete?: (options?: { skipped?: boolean }) => void;
};

/** Extended onboarding: headline → after it fades out, tap-revealed “How it works” + steps. */
function completeHeadlinePhase(
  onHeadlinePhaseComplete: Props["onHeadlinePhaseComplete"],
  skipped: boolean,
  setHeadlineVisible: (visible: boolean) => void,
  setHowItWorksMounted: (mounted: boolean) => void,
) {
  setHeadlineVisible(false);
  setHowItWorksMounted(true);
  onHeadlinePhaseComplete?.(skipped ? { skipped: true } : undefined);
}

export function OnboardingPhasedContent({
  revealedLineCount,
  tapReveal = true,
  headlineSkipRequest = 0,
  onHeadlinePhaseComplete,
}: Props) {
  const highContrast = useHighContrast();
  const headlineOpacity = useRef(new Animated.Value(0)).current;
  const headlineAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const headlineSkippedRef = useRef(false);
  const [howItWorksMounted, setHowItWorksMounted] = useState(false);
  const [headlineVisible, setHeadlineVisible] = useState(true);
  const headlineStyle = [styles.mainText, highContrast && styles.mainTextHighContrast];

  useEffect(() => {
    let cancelled = false;
    const fadeOutMs = getOnboardingHeadlineFadeOutMs();

    headlineSkippedRef.current = false;
    headlineOpacity.setValue(0);
    setHowItWorksMounted(false);
    setHeadlineVisible(true);

    const animation = Animated.sequence([
      Animated.delay(copyReveal.delayMs),
      Animated.timing(headlineOpacity, {
        toValue: 1,
        duration: copyReveal.fadeMs,
        easing: FADE_IN_EASING,
        useNativeDriver: true,
      }),
      Animated.delay(getOnboardingHeadlineHoldMs()),
      Animated.timing(headlineOpacity, {
        toValue: 0,
        duration: fadeOutMs,
        easing: FADE_OUT_EASING,
        useNativeDriver: true,
      }),
    ]);
    headlineAnimationRef.current = animation;

    animation.start(({ finished }) => {
      if (!cancelled && finished && !headlineSkippedRef.current) {
        completeHeadlinePhase(onHeadlinePhaseComplete, false, setHeadlineVisible, setHowItWorksMounted);
      }
    });

    return () => {
      cancelled = true;
      headlineAnimationRef.current?.stop();
      headlineAnimationRef.current = null;
    };
  }, [headlineOpacity, onHeadlinePhaseComplete]);

  useEffect(() => {
    if (headlineSkipRequest === 0 || headlineSkippedRef.current || howItWorksMounted) {
      return;
    }

    headlineSkippedRef.current = true;
    headlineAnimationRef.current?.stop();
    headlineAnimationRef.current = null;

    const fadeOutMs = getOnboardingHeadlineFadeOutMs();
    Animated.timing(headlineOpacity, {
      toValue: 0,
      duration: fadeOutMs,
      easing: FADE_OUT_EASING,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) return;
      completeHeadlinePhase(onHeadlinePhaseComplete, true, setHeadlineVisible, setHowItWorksMounted);
    });
  }, [headlineOpacity, headlineSkipRequest, howItWorksMounted, onHeadlinePhaseComplete]);

  return (
    <View style={styles.fill}>
      {howItWorksMounted ? (
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

      {headlineVisible ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.headlineOverlay, { opacity: headlineOpacity }]}
        >
          <View style={styles.headlineTextWrap}>
            <CalmText style={headlineStyle}>{uiCopy.onboardingLine}</CalmText>
          </View>
        </Animated.View>
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
    paddingTop: spacing.sm,
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
  headlineOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-start",
    alignItems: "stretch",
  },
  headlineTextWrap: {
    width: "100%",
    alignSelf: "stretch",
    minWidth: 0,
    paddingHorizontal: spacing.xs,
  },
  mainText: mainCopyTextStyle,
  mainTextHighContrast: {
    color: colors.textPrimary,
  },
});
