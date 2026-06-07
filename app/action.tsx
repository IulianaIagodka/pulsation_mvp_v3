import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "expo-router";
import {
  Animated,
  Easing,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from "react-native";
import { getCappedFontScale } from "../src/design/accessibility";
import { CalmText } from "../src/design/components/CalmText";
import { AnchoredCirclesScreen } from "../src/design/components/AnchoredCirclesScreen";
import { ExplanationText } from "../src/design/components/ExplanationText";
import { useFlowMainCopyRevealKey } from "../src/hooks/use-flow-main-copy-reveal-key";
import { useRegisterCirclesHint } from "../src/hooks/use-register-circles-hint";
import { useRegisterCirclesPress } from "../src/hooks/use-register-circles-press";
import {
  activeLocale,
  getTriangleBreathPhaseLabels,
  interventionGuidance,
  triangleBreathCopy,
  uiCopy,
} from "../src/modules/delivery-layer";
import { getFindThreeIntro, getFindThreeVariant } from "../src/modules/find-three-variants";
import { assignNextFindThreeVariant } from "../src/services/find-three-flow";
import { armInstantTriggerReturn } from "../src/design/flow-copy-reveal";
import { registerInterventionOutcome } from "../src/services/pulsation-flow";
import { useAppStore } from "../src/state/app-store";
import {
  ALL_INTERVENTIONS,
  DEFAULT_INTERVENTION,
  getIntervention,
  isSimpleInstruction,
} from "../src/interventions/registry";
import { colors, spacing } from "../src/design/tokens";
import {
  breathingRhythm,
  getFindThreeIntroDelayMs,
  getFindThreeTapHintDelayMs,
  getFlowTapHintDelayAfterRevealMs,
  getFlowTapHintDelayMs,
  getMainCopyDelayMs,
  getTriangleBreathIntroDelayMs,
} from "../src/design/animation-rhythm";
import { useCirclesHintPresentation } from "../src/hooks/use-circles-hint-presentation";
import { legibleOpacity } from "../src/design/accessibility";
import { CalmPressable } from "../src/design/components/CalmPressable";
import { useHighContrast } from "../src/hooks/use-high-contrast";
import { scaleByWidth } from "../src/design/responsive";
import { startTriangleBreathHapticLoop } from "../src/services/haptic-regulation";

const showDebugActionSelector = process.env.EXPO_PUBLIC_ENABLE_DEBUG_ACTION_SELECTOR === "true";

export default function ActionScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const fontScale = getCappedFontScale();
  const phaseSlotHeight = Math.round(scaleByWidth(15, width) * fontScale) + scaleByWidth(spacing.sm, width);
  const findThreeLineMinHeight = Math.round(scaleByWidth(15, width) * fontScale);
  const highContrast = useHighContrast();
  const copyRevealKey = useFlowMainCopyRevealKey();
  const mainLineDelayMs = getMainCopyDelayMs();
  const phaseLabelOpacity = legibleOpacity(
    breathingRhythm.explanationText.textOpacity,
    highContrast,
    "muted",
  );
  const setSelected = useAppStore((s) => s.setSelectedIntervention);
  const selected = useAppStore((s) => s.selectedIntervention) ?? DEFAULT_INTERVENTION;
  const presentation = getIntervention(selected).presentation;
  const findThreeVariantIndex = useAppStore((s) => s.findThreeVariantIndex);
  const setFindThreeVariantIndex = useAppStore((s) => s.setFindThreeVariantIndex);
  const locale = activeLocale === "uk" ? "uk" : "en";
  const phaseLabels = getTriangleBreathPhaseLabels();
  const findThreeQueue = useMemo(() => {
    const index = findThreeVariantIndex ?? 0;
    return [...getFindThreeVariant(index, locale).items];
  }, [findThreeVariantIndex, locale]);
  const inhaleOpacity = useRef(new Animated.Value(0)).current;
  const holdOpacity = useRef(new Animated.Value(0)).current;
  const exhaleOpacity = useRef(new Animated.Value(0)).current;
  const completionRef = useRef(false);
  const isTransitioningRef = useRef(false);
  const [showTriangleTapHint, setShowTriangleTapHint] = useState(false);
  const [findThreeRevealedCount, setFindThreeRevealedCount] = useState(0);
  const [findThreeSequenceStarted, setFindThreeSequenceStarted] = useState(false);
  const findThreeIntroTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const findThreeSessionRef = useRef(0);
  const findThreeAllRevealed =
    presentation === "find_three" && findThreeRevealedCount >= findThreeQueue.length;
  const hintAfterRevealMs = getFlowTapHintDelayAfterRevealMs();
  const simpleHintDelayMs = getFlowTapHintDelayMs(mainLineDelayMs);
  const findThreeHintDelayMs = getFindThreeTapHintDelayMs(findThreeQueue.length, mainLineDelayMs);
  const nonTriangleHint = useCirclesHintPresentation(
    presentation === "find_three" ? findThreeHintDelayMs : simpleHintDelayMs,
  );
  const triangleHint = useCirclesHintPresentation(hintAfterRevealMs);

  const completeAction = useCallback(() => {
    if (completionRef.current) return;
    completionRef.current = true;
    isTransitioningRef.current = true;
    registerInterventionOutcome(selected, true);
    armInstantTriggerReturn();
    router.replace("/return");
  }, [router, selected]);

  const cancelFindThreeIntroTimer = useCallback(() => {
    if (findThreeIntroTimerRef.current) {
      clearTimeout(findThreeIntroTimerRef.current);
      findThreeIntroTimerRef.current = null;
    }
  }, []);

  const revealNextFindThreeBullet = useCallback(() => {
    cancelFindThreeIntroTimer();
    setFindThreeSequenceStarted(true);
    setFindThreeRevealedCount((c) => Math.min(c + 1, findThreeQueue.length));
  }, [cancelFindThreeIntroTimer, findThreeQueue.length]);

  const onCirclesTap = useCallback(() => {
    if (presentation === "find_three" && !findThreeAllRevealed) {
      revealNextFindThreeBullet();
      return;
    }
    completeAction();
  }, [completeAction, findThreeAllRevealed, presentation, revealNextFindThreeBullet]);

  useRegisterCirclesPress(onCirclesTap);

  useEffect(() => {
    completionRef.current = false;
    isTransitioningRef.current = false;
    setShowTriangleTapHint(false);
    setFindThreeRevealedCount(0);
    setFindThreeSequenceStarted(false);
    cancelFindThreeIntroTimer();
  }, [selected, cancelFindThreeIntroTimer]);

  useEffect(() => {
    if (presentation !== "find_three") return;

    const session = findThreeSessionRef.current + 1;
    findThreeSessionRef.current = session;
    const variantIndex = assignNextFindThreeVariant();
    setFindThreeVariantIndex(variantIndex);
    setFindThreeRevealedCount(0);
    setFindThreeSequenceStarted(false);
    cancelFindThreeIntroTimer();

    const bulletsStartMs = getFindThreeIntroDelayMs(mainLineDelayMs);
    findThreeIntroTimerRef.current = setTimeout(() => {
      if (findThreeSessionRef.current !== session) return;
      findThreeIntroTimerRef.current = null;
      setFindThreeSequenceStarted(true);
      setFindThreeRevealedCount(1);
    }, bulletsStartMs);

    return () => {
      findThreeSessionRef.current += 1;
      cancelFindThreeIntroTimer();
    };
  }, [presentation, mainLineDelayMs, cancelFindThreeIntroTimer, setFindThreeVariantIndex]);

  useEffect(() => {
    if (presentation !== "find_three" || !findThreeSequenceStarted) return;

    const intervalMs = breathingRhythm.findThreeThings.autoRevealIntervalMs;
    const intervalId = setInterval(() => {
      setFindThreeRevealedCount((c) => Math.min(c + 1, findThreeQueue.length));
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, [presentation, findThreeSequenceStarted, findThreeQueue.length]);

  useEffect(() => {
    if (presentation !== "triangle_breath") {
      inhaleOpacity.setValue(0);
      holdOpacity.setValue(0);
      exhaleOpacity.setValue(0);
      return;
    }

    const { inhaleMs, holdMs, exhaleMs, labelFadeMs } = breathingRhythm.triangleBreath;
    const fade = labelFadeMs;
    const phaseVisible = (phaseMs: number) => Math.max(0, phaseMs - fade * 2);
    const introDelayMs = getTriangleBreathIntroDelayMs(mainLineDelayMs);

    const oneCycle = Animated.sequence([
        Animated.timing(inhaleOpacity, {
          toValue: 1,
          duration: fade,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(phaseVisible(inhaleMs)),
        Animated.timing(inhaleOpacity, {
          toValue: 0,
          duration: fade,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(holdOpacity, {
          toValue: 1,
          duration: fade,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(phaseVisible(holdMs)),
        Animated.timing(holdOpacity, {
          toValue: 0,
          duration: fade,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(exhaleOpacity, {
          toValue: 1,
          duration: fade,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(phaseVisible(exhaleMs)),
        Animated.timing(exhaleOpacity, {
          toValue: 0,
          duration: fade,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
    ]);

    const fullBreath = Animated.sequence(
      Array.from({ length: breathingRhythm.triangleBreath.cycles }, () => oneCycle),
    );

    let cancelled = false;
    const startId = setTimeout(() => {
      if (cancelled) return;
      fullBreath.start(({ finished }) => {
        if (!finished || completionRef.current || cancelled) return;
        setShowTriangleTapHint(true);
      });
    }, introDelayMs);

    return () => {
      cancelled = true;
      clearTimeout(startId);
      fullBreath.stop();
      if (!isTransitioningRef.current) {
        inhaleOpacity.setValue(0);
        holdOpacity.setValue(0);
        exhaleOpacity.setValue(0);
      }
    };
  }, [exhaleOpacity, holdOpacity, inhaleOpacity, presentation]);

  useEffect(() => {
    if (presentation !== "triangle_breath") return;

    let stopHaptics: (() => void) | null = null;
    const introDelayMs = getTriangleBreathIntroDelayMs(mainLineDelayMs);
    const startId = setTimeout(() => {
      stopHaptics = startTriangleBreathHapticLoop();
    }, introDelayMs);

    return () => {
      clearTimeout(startId);
      stopHaptics?.();
    };
  }, [presentation]);

  const hintRegistration = useMemo(() => {
    if (presentation === "triangle_breath") {
      return {
        presentation: triangleHint,
        delayMs: hintAfterRevealMs,
        visible: showTriangleTapHint,
        label: uiCopy.tapContinueHint,
        holdAfterReveal: true,
      };
    }
    return {
      presentation: nonTriangleHint,
      delayMs: presentation === "find_three" ? hintAfterRevealMs : simpleHintDelayMs,
      visible: presentation === "find_three" ? findThreeAllRevealed : true,
      label: uiCopy.tapContinueHint,
      holdAfterReveal: true,
    };
  }, [
    findThreeAllRevealed,
    hintAfterRevealMs,
    nonTriangleHint,
    presentation,
    showTriangleTapHint,
    simpleHintDelayMs,
    triangleHint,
  ]);
  useRegisterCirclesHint(hintRegistration);

  const mainLineOnly =
    presentation === "find_three" ? (
      <ExplanationText key={`main-${copyRevealKey}`} holdAfterReveal variant="main">
        {getFindThreeIntro(locale)}
      </ExplanationText>
    ) : presentation === "triangle_breath" ? (
      <ExplanationText key={`main-${copyRevealKey}`} holdAfterReveal variant="main">
        {triangleBreathCopy.intro}
      </ExplanationText>
    ) : isSimpleInstruction(selected) ? (
      <ExplanationText key={`main-${copyRevealKey}`} holdAfterReveal variant="main">
        {interventionGuidance[selected].actionText}
      </ExplanationText>
    ) : null;

  const afterMainLine =
    presentation === "find_three" ? (
      <View style={styles.findThreeBelow}>
        <CalmPressable
          onPress={revealNextFindThreeBullet}
          accessibilityRole="button"
          accessibilityLabel={getFindThreeIntro(locale)}
          style={styles.findThreeBulletPress}
        >
          {findThreeSequenceStarted
            ? findThreeQueue.map((item, index) =>
                index < findThreeRevealedCount ? (
                  <ExplanationText
                    key={`${copyRevealKey}-${findThreeVariantIndex ?? 0}-${index}`}
                    variant="explanation"
                    holdAfterReveal
                    delayMs={0}
                    style={[
                      index === 0 ? styles.findThreeFirstLine : styles.findThreeLine,
                      {
                        marginTop: index === 0 ? 0 : scaleByWidth(2, width),
                        minHeight: findThreeLineMinHeight,
                      },
                    ]}
                  >
                    {`• ${item}`}
                  </ExplanationText>
                ) : null,
              )
            : null}
        </CalmPressable>
      </View>
    ) : presentation === "triangle_breath" ? (
      <View style={styles.triangleBelow}>
        <View style={styles.trianglePhasesWrap}>
          <View
            style={[
              styles.phaseWordLayer,
              {
                marginTop: scaleByWidth(spacing.md, width),
                minHeight: phaseSlotHeight,
              },
            ]}
          >
            <Animated.View style={[styles.phaseWord, { opacity: inhaleOpacity }]}>
              <CalmText style={[styles.phaseLabel, { opacity: phaseLabelOpacity }, highContrast && styles.phaseLabelHighContrast]}>
                {phaseLabels.breatheIn}
              </CalmText>
            </Animated.View>
            <Animated.View style={[styles.phaseWord, { opacity: holdOpacity }]}>
              <CalmText style={[styles.phaseLabel, { opacity: phaseLabelOpacity }, highContrast && styles.phaseLabelHighContrast]}>
                {phaseLabels.hold}
              </CalmText>
            </Animated.View>
            <Animated.View style={[styles.phaseWord, { opacity: exhaleOpacity }]}>
              <CalmText style={[styles.phaseLabel, { opacity: phaseLabelOpacity }, highContrast && styles.phaseLabelHighContrast]}>
                {phaseLabels.breatheOut}
              </CalmText>
            </Animated.View>
          </View>
        </View>
      </View>
    ) : null;

  const belowEquator =
    __DEV__ && showDebugActionSelector ? (
      <View style={styles.debugRow}>
        {ALL_INTERVENTIONS.map((type) => (
          <TouchableWithoutFeedback key={type} onPress={() => setSelected(type)}>
            <View style={styles.debugItem}>
              <CalmText style={styles.debugText}>{getIntervention(type).debugLabel}</CalmText>
            </View>
          </TouchableWithoutFeedback>
        ))}
      </View>
    ) : null;

  return (
    <AnchoredCirclesScreen pinMainLikeTrigger belowEquator={belowEquator} mainLine={mainLineOnly}>
      {afterMainLine}
    </AnchoredCirclesScreen>
  );
}

const styles = StyleSheet.create({
  findThreeBelow: {
    width: "100%",
    alignSelf: "stretch",
    minWidth: 0,
    alignItems: "stretch",
    marginTop: spacing.md,
  },
  triangleBelow: {
    width: "100%",
    alignSelf: "stretch",
    minWidth: 0,
    alignItems: "stretch",
  },
  trianglePhasesWrap: {
    width: "100%",
    alignItems: "stretch",
    alignSelf: "stretch",
    minWidth: 0,
  },
  findThreeBulletPress: {
    width: "100%",
    alignSelf: "stretch",
    minWidth: 0,
    alignItems: "stretch",
    borderRadius: 12,
  },
  findThreeLine: {},
  findThreeFirstLine: {},
  phaseLabel: {
    color: colors.textSecondary,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.15,
    width: "100%",
  },
  phaseLabelHighContrast: {
    color: colors.textPrimary,
  },
  phaseWordLayer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  phaseWord: {
    position: "absolute",
    left: 0,
    right: 0,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  debugRow: { marginTop: spacing.md, flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: spacing.md },
  debugItem: { paddingVertical: spacing.xs },
  debugText: { color: colors.textSecondary, fontSize: 13 },
});
