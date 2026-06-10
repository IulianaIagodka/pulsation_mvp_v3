import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect, usePathname, useRouter } from "expo-router";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { AnchoredCirclesScreen } from "../src/design/components/AnchoredCirclesScreen";
import { AboutFooterLink } from "../src/design/components/AboutFooterLink";
import { CalmText } from "../src/design/components/CalmText";
import { ExplanationText } from "../src/design/components/ExplanationText";
import { pickReturnExplanation, uiCopy } from "../src/modules/delivery-layer";
import { DEFAULT_INTERVENTION } from "../src/interventions/registry";
import { useAppStore } from "../src/state/app-store";
import { copyReveal, getReturnExplanationDelayMs, getReturnKeepForMeAfterExplanationMs } from "../src/design/animation-rhythm";
import { legibleOpacity } from "../src/design/accessibility";
import { useHighContrast } from "../src/hooks/use-high-contrast";
import { useFlowMainCopyDelayMs } from "../src/hooks/use-flow-main-copy-delay-ms";
import { useRegisterCirclesPress } from "../src/hooks/use-register-circles-press";
import {
  hasKeptIntervention,
  markInterventionKept,
  registerExplanationEngagement,
} from "../src/services/adaptive-preferences";
import { playKeepForMeHaptic } from "../src/services/haptic-regulation";
import { footerFaintLinkOpacity, footerLinkTextStyle } from "../src/design/main-copy";
import { colors, spacing } from "../src/design/tokens";
import { clearFlowCopyRevealed, hasFlowCopyRevealed } from "../src/design/flow-copy-reveal";
import { flowRevealIds } from "../src/design/flow-reveal-ids";
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
  const [explanationRevealed, setExplanationRevealed] = useState(false);
  const [explanationTapEarly, setExplanationTapEarly] = useState(false);
  const [keepForMeFocusEpoch, setKeepForMeFocusEpoch] = useState(0);
  const keepForMeDismissedRef = useRef(false);
  const enteredAtRef = useRef<number>(Date.now());
  const keepForMeTappedRef = useRef(false);
  const engagementSavedRef = useRef(false);
  const keepForMeOpacity = useRef(new Animated.Value(0)).current;

  const mainLineDelayMs = useFlowMainCopyDelayMs();
  const returnExplanationDelayMs = getReturnExplanationDelayMs(mainLineDelayMs);

  useEffect(() => {
    return () => {
      clearFlowCopyRevealed(flowRevealIds.returnMain);
    };
  }, []);

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
    if (!explanationRevealed) {
      if (!hasFlowCopyRevealed(flowRevealIds.returnMain)) {
        return;
      }
      setExplanationTapEarly(true);
      setExplanationRevealed(true);
      return;
    }
    persistEngagement();
    clear();
    goToTrigger(router, pathname);
  }, [clear, explanationRevealed, pathname, persistEngagement, router]);
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
      setExplanationRevealed(false);
      setExplanationTapEarly(false);
      keepForMeOpacity.setValue(0);
      setKeepForMeFocusEpoch((epoch) => epoch + 1);
    }, [keepForMeOpacity, selected]),
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setExplanationRevealed(true);
    }, returnExplanationDelayMs);
    return () => clearTimeout(timer);
  }, [returnExplanationDelayMs]);

  useEffect(() => {
    if (!explanationRevealed || isInterventionKept) {
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
    }, getReturnKeepForMeAfterExplanationMs());

    return () => clearTimeout(timer);
  }, [explanationRevealed, keepForMeOpacity, selected, isInterventionKept, keepForMeFocusEpoch]);

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

  const explanationDelayMs = explanationTapEarly ? 0 : returnExplanationDelayMs;

  const followUp = (
    <View style={styles.belowMain}>
      <ExplanationText
        key={explanationTapEarly ? "tap" : "auto"}
        variant="explanation"
        holdAfterReveal
        delayMs={explanationDelayMs}
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
        <ExplanationText variant="main" holdAfterReveal delayMs={mainLineDelayMs} revealId={flowRevealIds.returnMain}>
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
