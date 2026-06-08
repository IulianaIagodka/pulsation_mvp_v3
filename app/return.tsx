import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFocusEffect, usePathname, useRouter } from "expo-router";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { AnchoredCirclesScreen } from "../src/design/components/AnchoredCirclesScreen";
import { AboutFooterLink } from "../src/design/components/AboutFooterLink";
import { CalmText } from "../src/design/components/CalmText";
import { ExplanationText } from "../src/design/components/ExplanationText";
import { pickReturnExplanation, uiCopy } from "../src/modules/delivery-layer";
import { DEFAULT_INTERVENTION } from "../src/interventions/registry";
import { useAppStore } from "../src/state/app-store";
import {
  copyReveal,
  getReturnExplanationDelayMs,
  getReturnHintFadeOutDelayMs,
  getReturnKeepForMeDelayMs,
  getReturnTapHintDelayMs,
} from "../src/design/animation-rhythm";
import { armFlowScreenEntryDelay, getFlowMainCopyDelayMs } from "../src/design/flow-screen-transition";
import { legibleOpacity } from "../src/design/accessibility";
import { useHighContrast } from "../src/hooks/use-high-contrast";
import { useFlowMainCopyRevealKey } from "../src/hooks/use-flow-main-copy-reveal-key";
import { useRegisterCirclesHint } from "../src/hooks/use-register-circles-hint";
import { useRegisterCirclesPress } from "../src/hooks/use-register-circles-press";
import { useCirclesHintPresentation } from "../src/hooks/use-circles-hint-presentation";
import { useFlowTapHintRegistration } from "../src/hooks/use-flow-tap-hint-registration";
import {
  hasKeptIntervention,
  markInterventionKept,
  registerExplanationEngagement,
} from "../src/services/adaptive-preferences";
import { playKeepForMeHaptic } from "../src/services/haptic-regulation";
import { footerFaintLinkOpacity, footerLinkTextStyle } from "../src/design/main-copy";
import { colors, spacing } from "../src/design/tokens";
import { armInstantTriggerReturn, hasFlowCopyRevealed } from "../src/design/flow-copy-reveal";
import { flowRevealIds } from "../src/design/flow-reveal-ids";
import { getSchedulingProfile } from "../src/data/repositories/scheduling-profile-repo";
import { isLastGraceReturnCycle } from "../src/modules/circles-hint-presentation";
import { goToTrigger } from "../src/navigation/go-to-trigger";

export default function ReturnScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const highContrast = useHighContrast();
  const clear = useAppStore((s) => s.clearIntervention);
  const selected = useAppStore((s) => s.selectedIntervention) ?? DEFAULT_INTERVENTION;
  const [returnExplanation] = useState(() => pickReturnExplanation(selected));
  const [isInterventionKept, setIsInterventionKept] = useState(() => hasKeptIntervention(selected));
  const [showKeepForMe, setShowKeepForMe] = useState(false);
  const [keepForMeSavedThisVisit, setKeepForMeSavedThisVisit] = useState(false);
  const [keepForMeFocusEpoch, setKeepForMeFocusEpoch] = useState(0);
  const keepForMeDismissedRef = useRef(false);
  const enteredAtRef = useRef<number>(Date.now());
  const keepForMeTappedRef = useRef(false);
  const engagementSavedRef = useRef(false);
  const keepForMeOpacity = useRef(new Animated.Value(0)).current;

  const copyRevealKey = useFlowMainCopyRevealKey();
  const mainCopyDelayMs = useMemo(() => getFlowMainCopyDelayMs(), [copyRevealKey]);
  const returnExplanationDelayMs = getReturnExplanationDelayMs(mainCopyDelayMs);
  const keepForMeDelayMs = getReturnKeepForMeDelayMs(mainCopyDelayMs);
  const hintDelayMs = getReturnTapHintDelayMs(mainCopyDelayMs, !isInterventionKept);
  const circlesHintPresentation = useCirclesHintPresentation(hintDelayMs);
  const hintFadeOutDelayMs = useMemo(() => {
    const profile = getSchedulingProfile();
    const isLastGrace = isLastGraceReturnCycle(
      profile.totalCompleted,
      profile.tapHintRevealedAtCycle ?? null,
    );
    if (!isLastGrace || !hasFlowCopyRevealed(flowRevealIds.flowCirclesHint)) {
      return undefined;
    }
    return getReturnHintFadeOutDelayMs(mainCopyDelayMs, !isInterventionKept);
  }, [isInterventionKept, mainCopyDelayMs, copyRevealKey]);
  const hintRegistration = useFlowTapHintRegistration(
    circlesHintPresentation,
    hintDelayMs,
    true,
    hintFadeOutDelayMs,
  );
  useRegisterCirclesHint(hintRegistration);

  const persistEngagement = useCallback(() => {
    if (engagementSavedRef.current) return;
    engagementSavedRef.current = true;
    registerExplanationEngagement(selected, {
      keepForMeTapped: keepForMeTappedRef.current,
      dwellMs: Date.now() - enteredAtRef.current,
    });
  }, [selected]);

  const onKeepForMePress = useCallback(() => {
    if (keepForMeDismissedRef.current) return;
    keepForMeDismissedRef.current = true;
    keepForMeTappedRef.current = true;
    markInterventionKept(selected);
    persistEngagement();
    playKeepForMeHaptic();
    setKeepForMeSavedThisVisit(true);
  }, [persistEngagement, selected]);

  const onCirclesPress = useCallback(() => {
    persistEngagement();
    clear();
    armInstantTriggerReturn();
    armFlowScreenEntryDelay();
    goToTrigger(router, pathname);
  }, [clear, pathname, persistEngagement, router]);
  useRegisterCirclesPress(onCirclesPress);

  useFocusEffect(
    useCallback(() => {
      enteredAtRef.current = Date.now();
      keepForMeTappedRef.current = false;
      keepForMeDismissedRef.current = false;
      engagementSavedRef.current = false;
      setIsInterventionKept(hasKeptIntervention(selected));
      setShowKeepForMe(false);
      setKeepForMeSavedThisVisit(false);
      keepForMeOpacity.setValue(0);
      setKeepForMeFocusEpoch((epoch) => epoch + 1);
    }, [keepForMeOpacity, selected]),
  );

  useEffect(() => {
    if (isInterventionKept) {
      setShowKeepForMe(false);
      keepForMeOpacity.setValue(0);
      return;
    }

    keepForMeOpacity.setValue(0);
    const timer = setTimeout(() => {
      if (hasKeptIntervention(selected)) {
        setIsInterventionKept(true);
        return;
      }
      setShowKeepForMe(true);
      Animated.timing(keepForMeOpacity, {
        toValue: 1,
        duration: copyReveal.fadeMs,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    }, keepForMeDelayMs);

    return () => clearTimeout(timer);
  }, [keepForMeDelayMs, keepForMeOpacity, selected, isInterventionKept, keepForMeFocusEpoch]);

  useEffect(
    () => () => {
      persistEngagement();
    },
    [persistEngagement],
  );

  const savedLabelOpacity = legibleOpacity(footerFaintLinkOpacity, highContrast, "faint");

  const keepForMeFooter =
    !isInterventionKept ? (
      <View style={styles.keepFooter}>
        {showKeepForMe ? (
          <Animated.View style={{ opacity: keepForMeOpacity }}>
            {keepForMeSavedThisVisit ? (
              <CalmText
                style={[
                  styles.keepSavedLabel,
                  { opacity: savedLabelOpacity },
                  highContrast && styles.keepSavedLabelHighContrast,
                ]}
              >
                {uiCopy.keepForMeSaved}
              </CalmText>
            ) : (
              <AboutFooterLink label={uiCopy.keepForMe} onPress={onKeepForMePress} />
            )}
          </Animated.View>
        ) : (
          <View style={styles.keepFooterPlaceholder} />
        )}
      </View>
    ) : null;

  const followUp = (
    <View key={`below-main-${copyRevealKey}`} style={styles.belowMain}>
      <ExplanationText
        variant="explanation"
        holdAfterReveal
        delayMs={returnExplanationDelayMs}
        style={styles.explanationLine}
      >
        {returnExplanation}
      </ExplanationText>
    </View>
  );

  return (
    <AnchoredCirclesScreen
      pinMainLikeTrigger
      footer={keepForMeFooter}
      mainLine={
        <ExplanationText key={`main-${copyRevealKey}`} variant="main" holdAfterReveal>
          {uiCopy.returnBody}
        </ExplanationText>
      }
    >
      {followUp}
    </AnchoredCirclesScreen>
  );
}

const styles = StyleSheet.create({
  belowMain: {
    width: "100%",
    alignSelf: "stretch",
    minWidth: 0,
    alignItems: "stretch",
  },
  explanationLine: {
    marginTop: spacing.md,
  },
  keepFooter: {
    alignItems: "center",
    width: "100%",
  },
  keepFooterPlaceholder: {
    minHeight: 44,
  },
  keepSavedLabel: {
    ...footerLinkTextStyle,
    paddingVertical: 4,
    paddingHorizontal: spacing.md,
    minHeight: 44,
  },
  keepSavedLabelHighContrast: {
    color: colors.textPrimary,
  },
});
