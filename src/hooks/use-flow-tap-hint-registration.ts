import { useMemo } from "react";
import { copyReveal } from "../design/animation-rhythm";
import { hasFlowCopyRevealed } from "../design/flow-copy-reveal";
import { flowRevealIds } from "../design/flow-reveal-ids";
import type { CirclesHintPresentation } from "../modules/circles-hint-presentation";
import { uiCopy } from "../modules/delivery-layer";
import type { CirclesHintRegistration } from "../types/circles-hint-registration";

/** Shared tap hint — stays visible across flow screens for 2 cycles after first reveal. */
export function useFlowTapHintRegistration(
  presentation: CirclesHintPresentation,
  delayMs: number,
  visible = true,
  fadeOutDelayMs?: number,
): CirclesHintRegistration {
  return useMemo(() => {
    const flowHintRevealed = hasFlowCopyRevealed(flowRevealIds.flowCirclesHint);
    const graceActive = presentation.shouldShow;
    const persistVisible = flowHintRevealed && graceActive;
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
  }, [delayMs, fadeOutDelayMs, presentation, visible]);
}
