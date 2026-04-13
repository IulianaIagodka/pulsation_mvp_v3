import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "expo-router";
import { Animated, Easing, StyleSheet, TouchableWithoutFeedback, View } from "react-native";
import { CalmScreen } from "../src/design/components/CalmScreen";
import { CalmText } from "../src/design/components/CalmText";
import { FeetOnGroundSpiral } from "../src/design/components/FeetOnGroundSpiral";
import { FindThreeThingsSpiral } from "../src/design/components/FindThreeThingsSpiral";
import { SoftCard } from "../src/design/components/SoftCard";
import { TriangleBreathSpiral } from "../src/design/components/TriangleBreathSpiral";
import { interventionCopy, interventionGuidance, uiCopy } from "../src/modules/delivery-layer";
import { registerInterventionOutcome } from "../src/services/pulsation-flow";
import { useAppStore } from "../src/state/app-store";
import { colors, spacing, typography } from "../src/design/tokens";
import { breathingRhythm, spiralLayout } from "../src/design/animation-rhythm";

const showDebugActionSelector = process.env.EXPO_PUBLIC_ENABLE_DEBUG_ACTION_SELECTOR === "true";

export default function ActionScreen() {
  const router = useRouter();
  const setSelected = useAppStore((s) => s.setSelectedIntervention);
  const selected = useAppStore((s) => s.selectedIntervention) ?? "feet_on_ground";
  const isUkrainian = uiCopy.spiralHint === "торкнись спіралі";
  const findThreeQueue = useMemo(
    () =>
      isUkrainian
        ? ["щось кругле", "щось м’яке", "щось нерухоме"]
        : ["something round", "something soft", "something still"],
    [isUkrainian],
  );
  const findThreeOpacities = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const inhaleOpacity = useRef(new Animated.Value(0)).current;
  const exhaleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (selected !== "find_three_things") {
      findThreeOpacities.forEach((value) => value.setValue(0));
      return;
    }

    const showDelaysMs = breathingRhythm.findThreeThings.revealDelayMs;
    const timers = showDelaysMs.map((delay, index) =>
      setTimeout(() => {
        Animated.timing(findThreeOpacities[index], {
          toValue: 1,
          duration: breathingRhythm.findThreeThings.revealDurationMs,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      }, delay),
    );

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [findThreeOpacities, selected]);

  useEffect(() => {
    if (selected !== "triangle_breath") {
      inhaleOpacity.setValue(0);
      exhaleOpacity.setValue(0);
      return;
    }

    // Controlled pacing by count: inhale and exhale fade in/out, hold stays constant.
    const triangleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(inhaleOpacity, {
          toValue: 1,
          duration: breathingRhythm.triangleBreath.fadeDurationMs,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(breathingRhythm.triangleBreath.visibleDurationMs),
        Animated.timing(inhaleOpacity, {
          toValue: 0,
          duration: breathingRhythm.triangleBreath.fadeDurationMs,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(breathingRhythm.triangleBreath.holdBridgeDelayMs),
        Animated.timing(exhaleOpacity, {
          toValue: 1,
          duration: breathingRhythm.triangleBreath.fadeDurationMs,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(breathingRhythm.triangleBreath.visibleDurationMs),
        Animated.timing(exhaleOpacity, {
          toValue: 0,
          duration: breathingRhythm.triangleBreath.fadeDurationMs,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(breathingRhythm.triangleBreath.holdBridgeDelayMs),
      ]),
    );

    triangleLoop.start();
    return () => {
      triangleLoop.stop();
      inhaleOpacity.setValue(0);
      exhaleOpacity.setValue(0);
    };
  }, [exhaleOpacity, inhaleOpacity, selected]);
  const handleComplete = () => {
    registerInterventionOutcome(selected, true);
    router.push("/explanation");
  };

  return (
    <CalmScreen centered>
      <SoftCard>
        <View style={styles.spiralSlot}>
          {selected === "feet_on_ground" ? <FeetOnGroundSpiral onPress={handleComplete} /> : null}
          {selected === "triangle_breath" ? <TriangleBreathSpiral onPress={handleComplete} /> : null}
          {selected === "find_three_things" ? <FindThreeThingsSpiral onPress={handleComplete} /> : null}
        </View>
        <CalmText style={styles.title}>{interventionCopy[selected]}</CalmText>
        {selected === "find_three_things" ? (
          <View style={styles.sequenceWrap}>
            <CalmText style={styles.body}>
              {isUkrainian ? "Знайди три речі навколо себе:" : "Find three things around you:"}
            </CalmText>
            {findThreeQueue.map((item, index) => (
              <Animated.View key={item} style={{ opacity: findThreeOpacities[index] }}>
                <CalmText style={styles.sequenceItem}>{`• ${item}`}</CalmText>
              </Animated.View>
            ))}
          </View>
        ) : null}
        {selected === "triangle_breath" ? (
          <View style={styles.sequenceWrap}>
            <CalmText style={styles.body}>
              {isUkrainian ? "Слідуй за ритмом трикутника:" : "Follow the triangle rhythm:"}
            </CalmText>
            <View style={styles.phaseWordLayer}>
              <Animated.View style={{ opacity: inhaleOpacity }}>
                <CalmText style={styles.phaseLabel}>{isUkrainian ? "вдих" : "inhale"}</CalmText>
              </Animated.View>
              <CalmText style={styles.phaseHold}>{isUkrainian ? "затримка" : "hold"}</CalmText>
              <Animated.View style={{ opacity: exhaleOpacity }}>
                <CalmText style={styles.phaseLabel}>{isUkrainian ? "видих" : "exhale"}</CalmText>
              </Animated.View>
            </View>
          </View>
        ) : null}
        {selected === "feet_on_ground" ? <CalmText style={styles.body}>{interventionGuidance[selected].actionText}</CalmText> : null}
        <CalmText style={styles.hint}>{uiCopy.spiralHint}</CalmText>
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
      </SoftCard>
    </CalmScreen>
  );
}

const styles = StyleSheet.create({
  spiralSlot: { minHeight: spiralLayout.slotMinHeight, alignItems: "center", justifyContent: "center" },
  title: { fontSize: typography.gentle, marginBottom: spacing.md, color: colors.textPrimary, textAlign: "center" },
  body: { color: colors.textSecondary, textAlign: "center", fontSize: 16, lineHeight: 25 },
  sequenceWrap: { alignItems: "center", minHeight: 128 },
  sequenceItem: {
    color: colors.textSecondary,
    textAlign: "center",
    fontSize: 16,
    lineHeight: 26,
  },
  phaseLabel: {
    color: colors.textPrimary,
    textAlign: "center",
    fontSize: 24,
    lineHeight: 34,
  },
  phaseWordLayer: {
    marginTop: spacing.sm,
    minHeight: 118,
    alignItems: "center",
    justifyContent: "space-between",
  },
  phaseHold: {
    color: colors.textSecondary,
    textAlign: "center",
    fontSize: 18,
    lineHeight: 26,
  },
  hint: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    opacity: 0.38,
    fontSize: 12,
    letterSpacing: 0.4,
    textAlign: "center",
  },
  debugRow: { marginTop: spacing.md, flexDirection: "row", gap: spacing.md },
  debugItem: { paddingVertical: spacing.xs },
  debugText: { color: colors.textSecondary, fontSize: 13 },
});
