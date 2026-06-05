import { useCallback, useRef } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { AnchoredSpiralScreen } from "../src/design/components/AnchoredSpiralScreen";
import { ExplanationText } from "../src/design/components/ExplanationText";
import { InlineSpiralHintSlot } from "../src/design/components/InlineSpiralHintSlot";
import { clearInstantTriggerReturn, markTriggerFlowRevealed } from "../src/design/flow-copy-reveal";
import { uiCopy } from "../src/modules/delivery-layer";
import { useFlowMainCopyRevealKey } from "../src/hooks/use-flow-main-copy-reveal-key";
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

  const onSpiralPress = useCallback(() => {
    wentToActionRef.current = true;
    markTriggerFlowRevealed();
    router.push("/action");
  }, [router]);
  useRegisterSpiralPress(onSpiralPress);
  const hintDelayMs = getFlowSpiralHintDelayMs(triggerPromptDelayMs);
  const spiralHint = useSpiralHintPresentation(hintDelayMs);

  return (
    <AnchoredSpiralScreen
      showPathsLink
      pathsLinkRevealDelayMs={triggerPromptDelayMs}
      pinMainLikeTrigger
      mainLine={
        <ExplanationText key={`main-${copyRevealKey}`} variant="main" holdAfterReveal>
          {uiCopy.triggerPrompt}
        </ExplanationText>
      }
    >
      <InlineSpiralHintSlot
        key={`hint-${copyRevealKey}`}
        presentation={spiralHint}
        delayMs={hintDelayMs}
        holdAfterReveal
      />
    </AnchoredSpiralScreen>
  );
}
