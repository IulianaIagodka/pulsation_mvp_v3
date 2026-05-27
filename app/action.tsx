import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { Animated, Easing, StyleSheet, TouchableWithoutFeedback, View } from "react-native";
import { CalmText } from "../src/design/components/CalmText";
import { AnchoredSpiralScreen } from "../src/design/components/AnchoredSpiralScreen";
import { ExplanationText } from "../src/design/components/ExplanationText";
import { useRegisterSpiralPress } from "../src/hooks/use-register-spiral-press";
import { activeLocale, interventionGuidance, uiCopy } from "../src/modules/delivery-layer";
import { getFindThreeIntro, getFindThreeVariant } from "../src/modules/find-three-variants";
import { assignNextFindThreeVariant } from "../src/services/find-three-flow";
import { registerInterventionOutcome } from "../src/services/pulsation-flow";
import { useAppStore } from "../src/state/app-store";
import { colors, spacing } from "../src/design/tokens";
import { breathingRhythm, spiralHintTiming } from "../src/design/animation-rhythm";

const showDebugActionSelector = process.env.EXPO_PUBLIC_ENABLE_DEBUG_ACTION_SELECTOR === "true";

export default function ActionScreen() {
  const router = useRouter();
  const setSelected = useAppStore((s) => s.setSelectedIntervention);
  const selected = useAppStore((s) => s.selectedIntervention) ?? "feet_on_ground";
  const findThreeVariantIndex = useAppStore((s) => s.findThreeVariantIndex);
  const setFindThreeVariantIndex = useAppStore((s) => s.setFindThreeVariantIndex);
  const locale = activeLocale === "uk" ? "uk" : "en";
  const isUkrainian = locale === "uk";
  const findThreeQueue = useMemo(() => {
    const index = findThreeVariantIndex ?? 0;
    return [...getFindThreeVariant(index, locale).items];
  }, [findThreeVariantIndex, locale]);
  const inhaleOpacity = useRef(new Animated.Value(0)).current;
  const holdOpacity = useRef(new Animated.Value(0)).current;
  const exhaleOpacity = useRef(new Animated.Value(0)).current;
  const holdAfterExhaleOpacity = useRef(new Animated.Value(0)).current;
  const completionRef = useRef(false);
  const isTransitioningRef = useRef(false);
  const [showTriangleSpiralHint, setShowTriangleSpiralHint] = useState(false);

  const completeAction = useCallback(() => {
    if (completionRef.current) return;
    completionRef.current = true;
    isTransitioningRef.current = true;
    registerInterventionOutcome(selected, true);
    router.replace("/return");
  }, [router, selected]);
  useRegisterSpiralPress(completeAction);

  useEffect(() => {
    completionRef.current = false;
    isTransitioningRef.current = false;
    setShowTriangleSpiralHint(false);
  }, [selected]);

  useEffect(() => {
    if (selected !== "find_three_things") return;
    setFindThreeVariantIndex(assignNextFindThreeVariant());
  }, [selected, setFindThreeVariantIndex]);

  useEffect(() => {
    if (selected !== "triangle_breath") {
      inhaleOpacity.setValue(0);
      holdOpacity.setValue(0);
      exhaleOpacity.setValue(0);
      holdAfterExhaleOpacity.setValue(0);
      return;
    }

    const { inhaleMs, holdMs, exhaleMs, holdAfterExhaleMs, labelFadeMs } = breathingRhythm.triangleBreath;
    const fade = labelFadeMs;
    const phaseVisible = (phaseMs: number) => Math.max(0, phaseMs - fade * 2);

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
        Animated.timing(holdAfterExhaleOpacity, {
          toValue: 1,
          duration: fade,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(phaseVisible(holdAfterExhaleMs)),
        Animated.timing(holdAfterExhaleOpacity, {
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
    fullBreath.start(({ finished }) => {
      if (!finished || completionRef.current || cancelled) return;
      setShowTriangleSpiralHint(true);
    });

    return () => {
      cancelled = true;
      fullBreath.stop();
      if (!isTransitioningRef.current) {
        inhaleOpacity.setValue(0);
        holdOpacity.setValue(0);
        exhaleOpacity.setValue(0);
        holdAfterExhaleOpacity.setValue(0);
      }
    };
  }, [exhaleOpacity, holdAfterExhaleOpacity, holdOpacity, inhaleOpacity, selected]);

  return (
    <AnchoredSpiralScreen>
      <View style={styles.content}>
        {selected === "find_three_things" ? (
          <View style={styles.sequenceWrap}>
            <ExplanationText
              delayMs={breathingRhythm.explanationText.primaryDelayMs}
              style={styles.actionInstruction}
            >
              {getFindThreeIntro(locale)}
            </ExplanationText>
            {findThreeQueue.map((item, index) => (
              <ExplanationText
                key={`${findThreeVariantIndex ?? 0}-${index}`}
                delayMs={breathingRhythm.findThreeThings.revealDelayMs[index]}
                style={styles.findThreeLine}
              >
                {`• ${item}`}
              </ExplanationText>
            ))}
          </View>
        ) : null}
        {selected === "triangle_breath" ? (
          <View style={styles.sequenceWrap}>
            <View style={styles.phaseWordLayer}>
              <Animated.View style={[styles.phaseWord, { opacity: inhaleOpacity }]}>
                <CalmText style={styles.phaseLabel}>{isUkrainian ? "вдих" : "inhale"}</CalmText>
              </Animated.View>
              <Animated.View style={[styles.phaseWord, { opacity: holdOpacity }]}>
                <CalmText style={styles.phaseLabel}>{isUkrainian ? "затримка" : "hold"}</CalmText>
              </Animated.View>
              <Animated.View style={[styles.phaseWord, { opacity: exhaleOpacity }]}>
                <CalmText style={styles.phaseLabel}>{isUkrainian ? "видих" : "exhale"}</CalmText>
              </Animated.View>
              <Animated.View style={[styles.phaseWord, { opacity: holdAfterExhaleOpacity }]}>
                <CalmText style={styles.phaseLabel}>{isUkrainian ? "затримка" : "hold"}</CalmText>
              </Animated.View>
            </View>
          </View>
        ) : null}
        {selected === "feet_on_ground" ? (
          <ExplanationText delayMs={breathingRhythm.explanationText.primaryDelayMs} style={styles.actionInstruction}>
            {interventionGuidance[selected].actionText}
          </ExplanationText>
        ) : null}
        {__DEV__ && showDebugActionSelector ? (
          <View style={styles.debugRow}>
            <TouchableWithoutFeedback onPress={() => setSelected("feet_on_ground")}>
              <View style={styles.debugItem}>
                <CalmText style={styles.debugText}>Feet</CalmText>
              </View>
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback onPress={() => setSelected("find_three_things")}>
              <View style={styles.debugItem}>
                <CalmText style={styles.debugText}>Find 3</CalmText>
              </View>
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback onPress={() => setSelected("triangle_breath")}>
              <View style={styles.debugItem}>
                <CalmText style={styles.debugText}>Triangle</CalmText>
              </View>
            </TouchableWithoutFeedback>
          </View>
        ) : null}
        {selected === "triangle_breath" ? (
          showTriangleSpiralHint ? (
            <ExplanationText delayMs={0} style={styles.hintWrap}>
              {uiCopy.spiralHint}
            </ExplanationText>
          ) : null
        ) : (
          <ExplanationText
            delayMs={
              selected === "feet_on_ground"
                ? spiralHintTiming.actionAfterFeetInstructionMs
                : spiralHintTiming.actionAfterFindThreeMs
            }
            style={styles.hintWrap}
          >
            {uiCopy.spiralHint}
          </ExplanationText>
        )}
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
  findThreeLine: {
    marginTop: spacing.sm,
    minHeight: 36,
  },
  sequenceWrap: { alignItems: "center", width: "100%", minHeight: 128 },
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
  hintWrap: {
    marginTop: spacing.md,
  },
  debugRow: { marginTop: spacing.md, flexDirection: "row", gap: spacing.md },
  debugItem: { paddingVertical: spacing.xs },
  debugText: { color: colors.textSecondary, fontSize: 13 },
});
