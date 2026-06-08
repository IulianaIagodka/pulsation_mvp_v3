import { useMemo } from "react";
import { copyReveal } from "../design/animation-rhythm";
import { flowRevealIds } from "../design/flow-reveal-ids";
import { useHintSessionEpoch } from "./use-hint-session-epoch";
import type { CirclesHintPresentation } from "../modules/circles-hint-presentation";
import { shouldPersistFlowTapHint } from "../modules/circles-hint-presentation";
import { uiCopy } from "../modules/delivery-layer";
import type { CirclesHintRegistration } from "../types/circles-hint-registration";

/** Shared tap hint — stays visible across flow screens for 2 cycles after first reveal. */
export function useFlowTapHintRegistration(
  presentation: CirclesHintPresentation,
  delayMs: number,
  visible = true,
  fadeOutDelayMs?: number,
): CirclesHintRegistration {
  const hintSessionEpoch = useHintSessionEpoch();

  return useMemo(() => {
    const persistVisible = shouldPersistFlowTapHint(fadeOutDelayMs);
    return {
      presentation,
      delayMs: persistVisible ? 0 : delayMs,
      visible: persistVisible || visible,
      label: uiCopy.tapContinueHint,
      revealId: flowRevealIds.flowCirclesHint,
      holdAfterReveal: true,
      forceVisible: persistVisible,
      labelTransitionMs: copyReveal.fadeMs,
      fadeOutDelayMs,
    };
  }, [delayMs, fadeOutDelayMs, hintSessionEpoch, presentation, visible]);
}
