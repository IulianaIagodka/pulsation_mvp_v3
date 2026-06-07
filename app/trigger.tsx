import { useCallback, useMemo, useRef } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { AnchoredCirclesScreen } from "../src/design/components/AnchoredCirclesScreen";
import { ExplanationText } from "../src/design/components/ExplanationText";
import { clearInstantTriggerReturn, markTriggerFlowRevealed } from "../src/design/flow-copy-reveal";
import { flowRevealIds } from "../src/design/flow-reveal-ids";
import { uiCopy } from "../src/modules/delivery-layer";
import { useFlowMainCopyRevealKey } from "../src/hooks/use-flow-main-copy-reveal-key";
import { useRegisterCirclesHint } from "../src/hooks/use-register-circles-hint";
import { useRegisterCirclesPress } from "../src/hooks/use-register-circles-press";
import { decideIntervention, registerPulsationDismissed } from "../src/services/pulsation-flow";
import { useAppStore } from "../src/state/app-store";
import { playTriggerHaptic } from "../src/services/haptic-regulation";
import {
  getMainCopyDelayMs,
  getTriggerPathsLinkDelayMs,
  getTriggerTapHintDelayMs,
} from "../src/design/animation-rhythm";
import { useCirclesHintPresentation } from "../src/hooks/use-circles-hint-presentation";

export default function TriggerScreen() {
  const router = useRouter();
  const setSelected = useAppStore((s) => s.setSelectedIntervention);
  const wentToActionRef = useRef(false);
  const playedHapticRef = useRef(false);
  const copyRevealKey = useFlowMainCopyRevealKey();
  const triggerPromptDelayMs = getMainCopyDelayMs();

  useFocusEffect(
    useCallback(() => {
      wentToActionRef.current = false;
      setSelected(decideIntervention());
      clearInstantTriggerReturn();

      if (!playedHapticRef.current) {
        playedHapticRef.current = true;
        playTriggerHaptic();
      }

      return () => {
        if (!wentToActionRef.current) {
          registerPulsationDismissed();
        }
      };
    }, [setSelected]),
  );

  const onCirclesPress = useCallback(() => {
    wentToActionRef.current = true;
    markTriggerFlowRevealed();
    router.push("/action");
  }, [router]);
  useRegisterCirclesPress(onCirclesPress);
  const hintDelayMs = getTriggerTapHintDelayMs(triggerPromptDelayMs);
  const circlesHintPresentation = useCirclesHintPresentation(hintDelayMs);
  const hintRegistration = useMemo(
    () => ({
      presentation: circlesHintPresentation,
      delayMs: hintDelayMs,
      label: uiCopy.tapContinueHint,
      revealId: flowRevealIds.triggerCirclesHint,
      holdAfterReveal: true,
    }),
    [copyRevealKey, hintDelayMs, circlesHintPresentation],
  );
  useRegisterCirclesHint(hintRegistration);

  return (
    <AnchoredCirclesScreen
      showPathsLink
      pathsLinkRevealDelayMs={triggerPromptDelayMs}
      pathsLinkRevealKey={copyRevealKey}
      pinMainLikeTrigger
      mainLine={
        <ExplanationText
          key={`main-${copyRevealKey}`}
          variant="main"
          revealId={flowRevealIds.triggerMain}
          holdAfterReveal
        >
          {uiCopy.triggerPrompt}
        </ExplanationText>
      }
    />
  );
}
