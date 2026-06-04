import { useCallback, useRef } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { AnchoredSpiralScreen } from "../src/design/components/AnchoredSpiralScreen";
import { ExplanationText } from "../src/design/components/ExplanationText";
import { InlineSpiralHintSlot } from "../src/design/components/InlineSpiralHintSlot";
import {
  clearInstantTriggerReturn,
  hasFlowCopyRevealed,
  markTriggerFlowRevealed,
  shouldInstantFlowReveal,
} from "../src/design/flow-copy-reveal";
import { flowRevealIds } from "../src/design/flow-reveal-ids";
import { uiCopy } from "../src/modules/delivery-layer";
import { useRegisterSpiralPress } from "../src/hooks/use-register-spiral-press";
import { decideIntervention, registerPulsationDismissed } from "../src/services/pulsation-flow";
import { useAppStore } from "../src/state/app-store";
import { playTriggerHaptic } from "../src/services/haptic-regulation";
import { getFlowSpiralHintDelayMs, getMainCopyDelayMs } from "../src/design/animation-rhythm";
import { useSpiralHintPresentation } from "../src/hooks/use-spiral-hint-presentation";

export default function TriggerScreen() {
  const router = useRouter();
  const setSelected = useAppStore((s) => s.setSelectedIntervention);
  const wentToActionRef = useRef(false);
  const triggerPromptDelayMs = getMainCopyDelayMs();
  const showTriggerInstant = shouldInstantFlowReveal(flowRevealIds.triggerMain);

  useFocusEffect(
    useCallback(() => {
      wentToActionRef.current = false;
      setSelected(decideIntervention());
      clearInstantTriggerReturn();

      return () => {
        if (!wentToActionRef.current) {
          registerPulsationDismissed();
        }
      };
    }, [setSelected]),
  );

  const onSpiralPress = useCallback(() => {
    wentToActionRef.current = true;
    markTriggerFlowRevealed();
    router.push("/action");
  }, [router]);
  useRegisterSpiralPress(onSpiralPress);
  const hintDelayMs = getFlowSpiralHintDelayMs(triggerPromptDelayMs);
  const spiralHint = useSpiralHintPresentation(hintDelayMs);

  useFocusEffect(
    useCallback(() => {
      if (!hasFlowCopyRevealed(flowRevealIds.triggerMain)) {
        playTriggerHaptic();
      }
    }, []),
  );

  return (
    <AnchoredSpiralScreen
      showPathsLink
      pathsLinkRevealDelayMs={triggerPromptDelayMs}
      pathsLinkRevealId={flowRevealIds.triggerPaths}
      pathsLinkForceVisible={showTriggerInstant}
      pinMainLikeTrigger
      mainLine={
        <ExplanationText
          variant="main"
          holdAfterReveal
          revealId={flowRevealIds.triggerMain}
          forceVisible={showTriggerInstant}
        >
          {uiCopy.triggerPrompt}
        </ExplanationText>
      }
    >
      <InlineSpiralHintSlot
        presentation={spiralHint}
        delayMs={hintDelayMs}
        holdAfterReveal
        revealId={flowRevealIds.triggerSpiralHint}
        forceVisible={showTriggerInstant}
      />
    </AnchoredSpiralScreen>
  );
}
