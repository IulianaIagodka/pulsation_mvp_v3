import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  useWindowDimensions,
  type EasingFunction,
} from "react-native";
import { useHighContrast } from "../../hooks/use-high-contrast";
import { uiCopy } from "../../modules/delivery-layer";
import type { CirclesHintPresentation } from "../../modules/circles-hint-presentation";
import { CalmText } from "./CalmText";
import { copyReveal } from "../animation-rhythm";
import { getCirclesToHintGap, getUnderCirclesHintSlotHeight } from "../circles-anchor-layout";
import { shouldPersistFlowTapHint } from "../../modules/circles-hint-presentation";
import { useHintSessionEpoch } from "../../hooks/use-hint-session-epoch";
import { dismissFlowCirclesHint, hasFlowCopyRevealed, shouldInstantFlowReveal } from "../flow-copy-reveal";
import { flowRevealIds } from "../flow-reveal-ids";
import { footerLinkTextStyle, getFooterFaintLinkStyle } from "../main-copy";
import { spacing } from "../tokens";
import { useFlowCopyReveal } from "../use-flow-copy-reveal";

const HINT_FADE_EASING = Easing.out(Easing.quad);

type Props = {
  presentation: CirclesHintPresentation;
  visible?: boolean;
  /** Overrides `presentation.delayMs` (e.g. onboarding: always last line). */
  delayMs?: number;
  fadeMs?: number;
  fadeEasing?: EasingFunction;
  /** Onboarding: `uiCopy.onboardingCirclesHint`. Flow: `uiCopy.tapContinueHint` (“tap to continue”). */
  label?: string;
  style?: StyleProp<ViewStyle>;
  holdAfterReveal?: boolean;
  revealId?: string;
  forceVisible?: boolean;
  labelTransitionMs?: number;
  fadeOutDelayMs?: number;
  /** Keep a fixed slot so layout never shifts when hint is hidden. */
  reserveSlot?: boolean;
};

/** Tap hint fixed under circles — slot stays; opacity hides when inactive. */
export function CirclesUnderHint({
  presentation,
  visible = true,
  delayMs,
  fadeMs = copyReveal.fadeMs,
  fadeEasing = HINT_FADE_EASING,
  label,
  style,
  holdAfterReveal = false,
  revealId,
  forceVisible = false,
  labelTransitionMs,
  fadeOutDelayMs,
  reserveSlot = true,
}: Props) {
  const { width } = useWindowDimensions();
  const highContrast = useHighContrast();
  const hintGap = getCirclesToHintGap(width);
  const slotHeight = getUnderCirclesHintSlotHeight(width);
  const resolvedLabel = label ?? uiCopy.tapContinueHint;
  useHintSessionEpoch();
  const persistGrace =
    revealId === flowRevealIds.flowCirclesHint && shouldPersistFlowTapHint(fadeOutDelayMs);
  const flowHintSessionLive =
    revealId !== flowRevealIds.flowCirclesHint || hasFlowCopyRevealed(flowRevealIds.flowCirclesHint);
  const instant = shouldInstantFlowReveal(revealId, forceVisible || persistGrace);
  const fadingOut = fadeOutDelayMs != null;
  const active =
    fadingOut || (flowHintSessionLive && (persistGrace || (visible && presentation.shouldShow)));
  const keepHintMounted =
    holdAfterReveal &&
    revealId != null &&
    hasFlowCopyRevealed(revealId) &&
    (presentation.shouldShow || persistGrace);
  const showHintContent = active || keepHintMounted;
  const transitionMs = labelTransitionMs ?? fadeMs;

  const revealOpacity = useRef(new Animated.Value(instant ? 1 : 0)).current;
  const fadeOutOpacity = useRef(new Animated.Value(1)).current;
  const [primaryLabel, setPrimaryLabel] = useState(resolvedLabel);
  const [secondaryLabel, setSecondaryLabel] = useState<string | null>(null);
  const primaryLabelOpacity = useRef(new Animated.Value(1)).current;
  const secondaryLabelOpacity = useRef(new Animated.Value(0)).current;
  const crossfadeGeneration = useRef(0);

  useFlowCopyReveal({
    opacity: revealOpacity,
    delayMs: delayMs ?? presentation.delayMs,
    fadeMs,
    fadeEasing,
    holdAfterReveal,
    revealId,
    forceVisible: instant,
  });

  useEffect(() => {
    if (resolvedLabel === primaryLabel && secondaryLabel == null) {
      return;
    }

    const canCrossfade =
      instant ||
      forceVisible ||
      (revealId != null && hasFlowCopyRevealed(revealId)) ||
      holdAfterReveal;

    if (!canCrossfade) {
      setPrimaryLabel(resolvedLabel);
      setSecondaryLabel(null);
      primaryLabelOpacity.setValue(1);
      secondaryLabelOpacity.setValue(0);
      return;
    }

    const generation = crossfadeGeneration.current + 1;
    crossfadeGeneration.current = generation;
    setSecondaryLabel(resolvedLabel);
    secondaryLabelOpacity.setValue(0);

    Animated.parallel([
      Animated.timing(primaryLabelOpacity, {
        toValue: 0,
        duration: transitionMs / 2,
        easing: fadeEasing,
        useNativeDriver: true,
      }),
      Animated.timing(secondaryLabelOpacity, {
        toValue: 1,
        duration: transitionMs / 2,
        easing: fadeEasing,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (!finished || crossfadeGeneration.current !== generation) {
        return;
      }
      setPrimaryLabel(resolvedLabel);
      setSecondaryLabel(null);
      primaryLabelOpacity.setValue(1);
      secondaryLabelOpacity.setValue(0);
    });
  }, [
    fadeEasing,
    forceVisible,
    holdAfterReveal,
    instant,
    primaryLabel,
    primaryLabelOpacity,
    resolvedLabel,
    revealId,
    secondaryLabel,
    secondaryLabelOpacity,
    transitionMs,
  ]);

  useEffect(() => {
    if (fadeOutDelayMs == null) {
      if (
        revealId === flowRevealIds.flowCirclesHint &&
        !hasFlowCopyRevealed(flowRevealIds.flowCirclesHint)
      ) {
        fadeOutOpacity.setValue(0);
        return;
      }
      if (revealId == null || !hasFlowCopyRevealed(revealId)) {
        fadeOutOpacity.setValue(1);
      }
      return;
    }

    fadeOutOpacity.setValue(1);

    const timer = setTimeout(() => {
      Animated.timing(fadeOutOpacity, {
        toValue: 0,
        duration: fadeMs,
        easing: fadeEasing,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!finished || revealId !== flowRevealIds.flowCirclesHint) {
          return;
        }
        dismissFlowCirclesHint();
      });
    }, fadeOutDelayMs);

    return () => clearTimeout(timer);
  }, [fadeEasing, fadeMs, fadeOutDelayMs, fadeOutOpacity, revealId]);

  const faintLinkStyle = getFooterFaintLinkStyle(highContrast);
  const combinedOpacity = Animated.multiply(revealOpacity, fadeOutOpacity);

  if (!reserveSlot && !active) {
    return null;
  }

  return (
    <View
      style={[
        styles.slot,
        { marginTop: hintGap },
        reserveSlot ? { minHeight: slotHeight } : null,
        style,
      ]}
    >
      <View
        style={[styles.inner, !active && styles.inactive]}
        pointerEvents={active ? "auto" : "none"}
      >
        {showHintContent ? (
          <View style={[styles.wrapHint, !active && styles.inactive]}>
            <Animated.View style={[styles.labelStack, { opacity: combinedOpacity }]}>
              <Animated.View style={[styles.labelLayer, { opacity: primaryLabelOpacity }]}>
                <CalmText style={faintLinkStyle}>{primaryLabel}</CalmText>
              </Animated.View>
              {secondaryLabel != null ? (
                <Animated.View style={[styles.labelOverlay, { opacity: secondaryLabelOpacity }]}>
                  <CalmText style={faintLinkStyle}>{secondaryLabel}</CalmText>
                </Animated.View>
              ) : null}
            </Animated.View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  inner: {
    width: "100%",
    alignItems: "center",
  },
  inactive: {
    opacity: 0,
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
  labelStack: {
    width: "100%",
    alignItems: "center",
    minHeight: footerLinkTextStyle.lineHeight ?? 15,
  },
  labelLayer: {
    width: "100%",
    alignItems: "center",
  },
  labelOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
});
