import { useCallback, useRef, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { AnchoredSpiralScreen } from "../src/design/components/AnchoredSpiralScreen";
import { ExplanationText } from "../src/design/components/ExplanationText";
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
  const hasFocusedOnceRef = useRef(false);
  const [promptRevealKey, setPromptRevealKey] = useState(0);
  const triggerPromptDelayMs = getMainCopyDelayMs();

  useFocusEffect(
    useCallback(() => {
      wentToActionRef.current = false;
      setSelected(decideIntervention());
      if (hasFocusedOnceRef.current) {
        setPromptRevealKey((key) => key + 1);
      } else {
        hasFocusedOnceRef.current = true;
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
    router.push("/action");
  }, [router]);
  useRegisterSpiralPress(onSpiralPress);
  const hintDelayMs = getFlowSpiralHintDelayMs(triggerPromptDelayMs);
  const spiralHint = useSpiralHintPresentation(hintDelayMs);

  useFocusEffect(
    useCallback(() => {
      playTriggerHaptic();
    }, []),
  );

  return (
    <AnchoredSpiralScreen
      showPathsLink
      pathsLinkRevealDelayMs={triggerPromptDelayMs}
      pathsLinkRevealKey={promptRevealKey}
      centerContent
      spiralHint={{ presentation: spiralHint, delayMs: hintDelayMs }}
    >
      <ExplanationText key={promptRevealKey} variant="main" holdAfterReveal>
        {uiCopy.triggerPrompt}
      </ExplanationText>
    </AnchoredSpiralScreen>
  );
}

