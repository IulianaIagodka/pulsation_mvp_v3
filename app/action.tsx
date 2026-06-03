import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "expo-router";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from "react-native";
import { CalmText } from "../src/design/components/CalmText";
import { AnchoredSpiralScreen } from "../src/design/components/AnchoredSpiralScreen";
import { ExplanationText } from "../src/design/components/ExplanationText";
import { SpiralUnderHint } from "../src/design/components/SpiralUnderHint";
import { useRegisterSpiralPress } from "../src/hooks/use-register-spiral-press";
import {
  activeLocale,
  getTriangleBreathPhaseLabels,
  interventionGuidance,
  triangleBreathCopy,
} from "../src/modules/delivery-layer";
import { getFindThreeIntro, getFindThreeVariant } from "../src/modules/find-three-variants";
import { assignNextFindThreeVariant } from "../src/services/find-three-flow";
import { registerInterventionOutcome } from "../src/services/pulsation-flow";
import { useAppStore } from "../src/state/app-store";
import {
  ALL_INTERVENTIONS,
  DEFAULT_INTERVENTION,
  getActionSpiralHintDelayMs,
  getIntervention,
  isSimpleInstruction,
} from "../src/interventions/registry";
import { colors, spacing } from "../src/design/tokens";
import {
  breathingRhythm,
  getFindThreeIntroDelayMs,
  getTriangleBreathIntroDelayMs,
} from "../src/design/animation-rhythm";
import { useSpiralHintPresentation } from "../src/hooks/use-spiral-hint-presentation";
import { scaleByWidth } from "../src/design/responsive";
import { startTriangleBreathHapticLoop } from "../src/services/haptic-regulation";

const showDebugActionSelector = process.env.EXPO_PUBLIC_ENABLE_DEBUG_ACTION_SELECTOR === "true";

export default function ActionScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
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
  const [showTriangleSpiralHint, setShowTriangleSpiralHint] = useState(false);
  const [findThreeRevealedCount, setFindThreeRevealedCount] = useState(0);
  const [findThreeSequenceStarted, setFindThreeSequenceStarted] = useState(false);
  const findThreeIntroTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const findThreeAllRevealed =
    presentation === "find_three" && findThreeRevealedCount >= findThreeQueue.length;
  const spiralHintDelayMs =
    presentation === "find_three"
      ? breathingRhythm.explanationText.fadeMs + 400
      : getActionSpiralHintDelayMs(selected);
  const nonTriangleHint = useSpiralHintPresentation(spiralHintDelayMs);
  const triangleHint = useSpiralHintPresentation(0);

  const completeAction = useCallback(() => {
    if (completionRef.current) return;
    completionRef.current = true;
    isTransitioningRef.current = true;
    registerInterventionOutcome(selected, true);
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

  const onSpiralTap = useCallback(() => {
    if (presentation === "find_three" && !findThreeAllRevealed) {
      revealNextFindThreeBullet();
      return;
    }
    completeAction();
  }, [completeAction, findThreeAllRevealed, presentation, revealNextFindThreeBullet]);

  useRegisterSpiralPress(onSpiralTap);

  useEffect(() => {
    completionRef.current = false;
    isTransitioningRef.current = false;
    setShowTriangleSpiralHint(false);
    setFindThreeRevealedCount(0);
    setFindThreeSequenceStarted(false);
    cancelFindThreeIntroTimer();
  }, [selected, cancelFindThreeIntroTimer]);

  useEffect(() => {
    if (presentation !== "find_three") return;

    setFindThreeRevealedCount(0);
    setFindThreeSequenceStarted(false);
    cancelFindThreeIntroTimer();

    const introMs = getFindThreeIntroDelayMs();
    findThreeIntroTimerRef.current = setTimeout(() => {
      findThreeIntroTimerRef.current = null;
      setFindThreeSequenceStarted(true);
      setFindThreeRevealedCount(1);
    }, introMs);

    return cancelFindThreeIntroTimer;
  }, [presentation, findThreeVariantIndex, cancelFindThreeIntroTimer]);

  useEffect(() => {
    if (presentation !== "find_three" || !findThreeSequenceStarted) return;

    const intervalMs = breathingRhythm.findThreeThings.autoRevealIntervalMs;
    const intervalId = setInterval(() => {
      setFindThreeRevealedCount((c) => Math.min(c + 1, findThreeQueue.length));
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, [presentation, findThreeSequenceStarted, findThreeQueue.length, findThreeVariantIndex]);

  useEffect(() => {
    if (presentation !== "find_three") return;
    setFindThreeVariantIndex(assignNextFindThreeVariant());
  }, [presentation, setFindThreeVariantIndex]);

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
    const introDelayMs = getTriangleBreathIntroDelayMs();

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
        setShowTriangleSpiralHint(true);
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
    const introDelayMs = getTriangleBreathIntroDelayMs();
    const startId = setTimeout(() => {
      stopHaptics = startTriangleBreathHapticLoop();
    }, introDelayMs);

    return () => {
      clearTimeout(startId);
      stopHaptics?.();
    };
  }, [presentation]);

  const underSpiralHint =
    presentation === "triangle_breath" ? (
      <SpiralUnderHint presentation={triangleHint} visible={showTriangleSpiralHint} />
    ) : (
      <SpiralUnderHint
        presentation={nonTriangleHint}
        visible={presentation === "find_three" ? findThreeAllRevealed : true}
      />
    );

  return (
    <AnchoredSpiralScreen spiralHint={underSpiralHint}>
      <View style={styles.content}>
        {presentation === "find_three" ? (
          <View style={styles.findThreeWrap}>
            <ExplanationText
              delayMs={breathingRhythm.explanationText.primaryDelayMs}
              variant="main"
              style={styles.findThreeIntro}
            >
              {getFindThreeIntro(locale)}
            </ExplanationText>
            <Pressable
              onPress={revealNextFindThreeBullet}
              accessibilityRole="button"
              accessibilityLabel={getFindThreeIntro(locale)}
              style={styles.findThreeBulletPress}
            >
              {findThreeSequenceStarted
                ? findThreeQueue.map((item, index) =>
                    index < findThreeRevealedCount ? (
                      <ExplanationText
                        key={`${findThreeVariantIndex ?? 0}-${index}`}
                        delayMs={0}
                        style={[
                          index === 0 ? styles.findThreeFirstLine : styles.findThreeLine,
                          { marginTop: scaleByWidth(index === 0 ? 12 : 4, width) },
                        ]}
                      >
                        {`• ${item}`}
                      </ExplanationText>
                    ) : null,
                  )
                : null}
            </Pressable>
          </View>
        ) : null}
        {presentation === "triangle_breath" ? (
          <View style={styles.sequenceWrap}>
            <ExplanationText
              delayMs={breathingRhythm.explanationText.primaryDelayMs}
              style={styles.triangleIntro}
            >
              {triangleBreathCopy.intro}
            </ExplanationText>
            <View style={[styles.phaseWordLayer, { marginTop: scaleByWidth(12, width) }]}>
              <Animated.View style={[styles.phaseWord, { opacity: inhaleOpacity }]}>
                <CalmText style={styles.phaseLabel}>{phaseLabels.breatheIn}</CalmText>
              </Animated.View>
              <Animated.View style={[styles.phaseWord, { opacity: holdOpacity }]}>
                <CalmText style={styles.phaseLabel}>{phaseLabels.hold}</CalmText>
              </Animated.View>
              <Animated.View style={[styles.phaseWord, { opacity: exhaleOpacity }]}>
                <CalmText style={styles.phaseLabel}>{phaseLabels.breatheOut}</CalmText>
              </Animated.View>
            </View>
          </View>
        ) : null}
        {isSimpleInstruction(selected) ? (
          <ExplanationText delayMs={breathingRhythm.explanationText.primaryDelayMs} style={styles.actionInstruction}>
            {interventionGuidance[selected].actionText}
          </ExplanationText>
        ) : null}
        {__DEV__ && showDebugActionSelector ? (
          <View style={styles.debugRow}>
            {ALL_INTERVENTIONS.map((type) => (
              <TouchableWithoutFeedback key={type} onPress={() => setSelected(type)}>
                <View style={styles.debugItem}>
                  <CalmText style={styles.debugText}>{getIntervention(type).debugLabel}</CalmText>
                </View>
              </TouchableWithoutFeedback>
            ))}
          </View>
        ) : null}
      </View>
    </AnchoredSpiralScreen>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: "center", width: "100%" },
  actionInstruction: {
    marginTop: spacing.md,
    minHeight: 40,
  },
  findThreeWrap: {
    alignItems: "center",
    width: "100%",
    minHeight: 128,
  },
  findThreeIntro: {
    marginTop: spacing.md,
    minHeight: 40,
  },
  findThreeBulletPress: {
    width: "100%",
    alignItems: "center",
  },
  findThreeLine: {
    minHeight: 30,
  },
  findThreeFirstLine: {
    minHeight: 30,
  },
  triangleIntro: {
    marginTop: spacing.md,
    minHeight: 44,
  },
  sequenceWrap: { alignItems: "center", width: "100%", minHeight: 160 },
  phaseLabel: {
    color: colors.textSecondary,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 22,
    letterSpacing: 0.15,
    width: "100%",
    opacity: breathingRhythm.explanationText.textOpacity,
  },
  phaseWordLayer: {
    marginTop: spacing.sm,
    minHeight: 60,
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
