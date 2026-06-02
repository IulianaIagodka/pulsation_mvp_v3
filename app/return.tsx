import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { Animated, Easing, Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import { AnchoredSpiralScreen } from "../src/design/components/AnchoredSpiralScreen";
import { ExplanationText } from "../src/design/components/ExplanationText";
import { pickReturnExplanation, uiCopy } from "../src/modules/delivery-layer";
import { DEFAULT_INTERVENTION } from "../src/interventions/registry";
import { useAppStore } from "../src/state/app-store";
import {
  breathingRhythm,
  getReturnKeepForMeDelayMs,
  spiralHintTiming,
} from "../src/design/animation-rhythm";
import { useRegisterSpiralPress } from "../src/hooks/use-register-spiral-press";
import { useSpiralHintPresentation } from "../src/hooks/use-spiral-hint-presentation";
import {
  hasKeptIntervention,
  markInterventionKept,
  registerExplanationEngagement,
} from "../src/services/adaptive-preferences";
import { playKeepForMeHaptic } from "../src/services/haptic-regulation";
import { spacing } from "../src/design/tokens";
import { scaleByWidth } from "../src/design/responsive";

export default function ReturnScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const clear = useAppStore((s) => s.clearIntervention);
  const selected = useAppStore((s) => s.selectedIntervention) ?? DEFAULT_INTERVENTION;
  const [returnExplanation, setReturnExplanation] = useState<string | null>(null);
  const [showKeepForMe, setShowKeepForMe] = useState(false);
  const [showKeepForMeHint, setShowKeepForMeHint] = useState(false);
  const [isKeepForMeFading, setIsKeepForMeFading] = useState(false);
  const enteredAtRef = useRef<number>(Date.now());
  const keepForMeTappedRef = useRef(false);
  const engagementSavedRef = useRef(false);
  const keepForMeOpacity = useRef(new Animated.Value(1)).current;

  const persistEngagement = useCallback(() => {
    if (engagementSavedRef.current) return;
    engagementSavedRef.current = true;
    registerExplanationEngagement(selected, {
      keepForMeTapped: keepForMeTappedRef.current,
      dwellMs: Date.now() - enteredAtRef.current,
    });
  }, [selected]);

  const onKeepForMePress = useCallback(() => {
    if (isKeepForMeFading) return;
    keepForMeTappedRef.current = true;
    markInterventionKept(selected);
    playKeepForMeHaptic();
    setIsKeepForMeFading(true);
    Animated.timing(keepForMeOpacity, {
      toValue: 0,
      duration: 260,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      setShowKeepForMe(false);
      setShowKeepForMeHint(false);
      setIsKeepForMeFading(false);
      keepForMeOpacity.setValue(1);
    });
  }, [isKeepForMeFading, keepForMeOpacity, selected]);

  const onSpiralPress = useCallback(() => {
    persistEngagement();
    clear();
    router.replace("/trigger");
  }, [clear, persistEngagement, router]);
  useRegisterSpiralPress(onSpiralPress);
  const spiralHint = useSpiralHintPresentation(spiralHintTiming.returnAfterFollowUpMs);
  const keepForMeDelayMs = useMemo(
    () =>
      getReturnKeepForMeDelayMs({
        spiralHintShows: spiralHint.shouldShow,
        spiralHintDelayMs: spiralHint.delayMs,
      }),
    [spiralHint.delayMs, spiralHint.shouldShow],
  );
  const keepForMeHintText = useMemo(() => uiCopy.keepForMeHint, [uiCopy.keepForMeHint]);

  useEffect(() => {
    enteredAtRef.current = Date.now();
    keepForMeTappedRef.current = false;
    engagementSavedRef.current = false;
    setShowKeepForMe(false);
    setShowKeepForMeHint(false);
    setIsKeepForMeFading(false);
    keepForMeOpacity.setValue(1);
    setReturnExplanation(pickReturnExplanation(selected));
  }, [keepForMeOpacity, selected]);

  useEffect(() => {
    if (!returnExplanation || hasKeptIntervention(selected)) {
      setShowKeepForMe(false);
      return;
    }
    const timer = setTimeout(() => setShowKeepForMe(true), keepForMeDelayMs);
    return () => clearTimeout(timer);
  }, [keepForMeDelayMs, returnExplanation, selected]);

  useEffect(
    () => () => {
      persistEngagement();
    },
    [persistEngagement],
  );

  return (
    <AnchoredSpiralScreen>
      <View style={styles.content}>
        <ExplanationText variant="main" delayMs={breathingRhythm.returnScreen.primaryDelayMs}>
          {uiCopy.returnBody}
        </ExplanationText>
        {returnExplanation ? (
          <>
            <ExplanationText
              delayMs={
                breathingRhythm.returnScreen.primaryDelayMs + breathingRhythm.explanationText.secondaryDelayMs
              }
              style={[styles.followUp, { marginTop: scaleByWidth(8, width) }]}
            >
              {returnExplanation}
            </ExplanationText>
          </>
        ) : null}
        {spiralHint.shouldShow ? (
          <ExplanationText
            delayMs={spiralHint.delayMs}
            style={[styles.hintWrap, { marginTop: scaleByWidth(12, width) }]}
            textOpacity={spiralHint.textOpacity}
          >
            {uiCopy.spiralHint}
          </ExplanationText>
        ) : null}
        {showKeepForMe && returnExplanation ? (
          <Animated.View style={{ width: "100%", opacity: keepForMeOpacity }}>
            {showKeepForMeHint ? (
              <ExplanationText
                delayMs={0}
                style={[styles.keepHintWrap, { marginTop: scaleByWidth(12, width) }]}
                textOpacity={breathingRhythm.explanationText.textOpacity}
              >
                {keepForMeHintText}
              </ExplanationText>
            ) : null}
            <Pressable
              onPress={onKeepForMePress}
              onHoverIn={() => setShowKeepForMeHint(true)}
              onHoverOut={() => setShowKeepForMeHint(false)}
              onFocus={() => setShowKeepForMeHint(true)}
              onBlur={() => setShowKeepForMeHint(false)}
              disabled={isKeepForMeFading}
              accessibilityRole="button"
              accessibilityLabel={uiCopy.keepForMe}
              hitSlop={8}
              style={({ pressed }) => [
                styles.keepWrap,
                { marginTop: scaleByWidth(10, width) },
                pressed && styles.keepWrapPressed,
              ]}
            >
              <ExplanationText delayMs={0} style={styles.keepExplanation}>
                {uiCopy.keepForMe}
              </ExplanationText>
            </Pressable>
          </Animated.View>
        ) : null}
      </View>
    </AnchoredSpiralScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: "center",
    width: "100%",
    alignSelf: "stretch",
    maxWidth: "100%",
  },
  followUp: {},
  keepWrap: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    opacity: 1,
  },
  keepWrapPressed: {
    opacity: 0.72,
  },
  keepExplanation: {
    minHeight: 28,
  },
  keepHintWrap: {},
  hintWrap: {},
});
