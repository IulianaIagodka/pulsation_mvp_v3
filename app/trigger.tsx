import { useCallback, useRef, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { AnchoredCirclesScreen } from "../src/design/components/AnchoredCirclesScreen";
import { ExplanationText } from "../src/design/components/ExplanationText";
import { flowRevealIds } from "../src/design/flow-reveal-ids";
import { uiCopy } from "../src/modules/delivery-layer";
import { useFlowMainCopyDelayMs } from "../src/hooks/use-flow-main-copy-delay-ms";
import { useRegisterCirclesPress } from "../src/hooks/use-register-circles-press";
import { decideIntervention, registerPulsationDismissed } from "../src/services/pulsation-flow";
import { useAppStore } from "../src/state/app-store";
import { playTriggerHaptic } from "../src/services/haptic-regulation";
import { hasPathsContent } from "../src/services/paths-stats";
import { getTriggerPathsLinkDelayMs } from "../src/design/animation-rhythm";
import { armFlowScreenEntryDelay } from "../src/design/flow-screen-transition";

export default function TriggerScreen() {
  const router = useRouter();
  const setSelected = useAppStore((s) => s.setSelectedIntervention);
  const wentToActionRef = useRef(false);
  const playedHapticRef = useRef(false);
  const mainLineDelayMs = useFlowMainCopyDelayMs();
  const pathsLinkDelayMs = getTriggerPathsLinkDelayMs(mainLineDelayMs);
  const [showPathsLink, setShowPathsLink] = useState(() => hasPathsContent());

  useFocusEffect(
    useCallback(() => {
      wentToActionRef.current = false;
      setShowPathsLink(hasPathsContent());
      setSelected(decideIntervention());

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
    armFlowScreenEntryDelay();
    router.push("/action");
  }, [router]);
  useRegisterCirclesPress(onCirclesPress);

  return (
    <AnchoredCirclesScreen
      showPathsLink={showPathsLink}
      pathsLinkRevealDelayMs={pathsLinkDelayMs}
      pinMainLikeTrigger
      mainLine={
        <ExplanationText
          variant="main"
          holdAfterReveal
          revealId={flowRevealIds.triggerMain}
          delayMs={mainLineDelayMs}
        >
          {uiCopy.triggerPrompt}
        </ExplanationText>
      }
    />
  );
}
