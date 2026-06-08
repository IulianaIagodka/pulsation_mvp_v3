import { recordTapHintRevealedAtCycle } from "../data/repositories/scheduling-profile-repo";
import { flowRevealIds } from "./flow-reveal-ids";

/** Persists “already revealed” across navigations within the same app session. */
const revealed = new Set<string>();

export function hasFlowCopyRevealed(revealId: string): boolean {
  return revealed.has(revealId);
}

/** Session + grace anchor when tap hint first appears (fade start or snap). */
export function markFlowCopyShown(revealId: string): void {
  revealed.add(revealId);
  if (revealId === flowRevealIds.flowCirclesHint) {
    recordTapHintRevealedAtCycle();
  }
}

export function markFlowCopyRevealed(revealId: string): void {
  markFlowCopyShown(revealId);
}

/** After last grace return fade-out — stop persisting tap hint for this session. */
export function dismissFlowCirclesHint(): void {
  revealed.delete(flowRevealIds.flowCirclesHint);
}

/** User finished or left the trigger step — skip entrance when they come back from return. */
export function markTriggerFlowRevealed(): void {
  markFlowCopyRevealed(flowRevealIds.triggerMain);
  markFlowCopyRevealed(flowRevealIds.triggerPaths);
}

let instantTriggerReturnPending = false;

/** Call right before navigating return → trigger (same tick as markTriggerFlowRevealed). */
export function armInstantTriggerReturn(): void {
  instantTriggerReturnPending = true;
  markTriggerFlowRevealed();
}

export function clearInstantTriggerReturn(): void {
  instantTriggerReturnPending = false;
}

export function isInstantTriggerReturnActive(): boolean {
  return instantTriggerReturnPending;
}

function isTriggerRevealId(revealId: string): boolean {
  return (
    revealId === flowRevealIds.triggerMain ||
    revealId === flowRevealIds.triggerPaths ||
    revealId === flowRevealIds.flowCirclesHint
  );
}

export function shouldInstantFlowReveal(revealId?: string, forceVisible?: boolean): boolean {
  if (forceVisible) return true;
  if (revealId != null && instantTriggerReturnPending && isTriggerRevealId(revealId)) {
    if (revealId === flowRevealIds.flowCirclesHint) {
      return hasFlowCopyRevealed(revealId);
    }
    return true;
  }
  if (
    revealId === flowRevealIds.flowCirclesHint ||
    revealId === flowRevealIds.triggerPaths ||
    revealId === flowRevealIds.triggerMain
  ) {
    return false;
  }
  return revealId != null && hasFlowCopyRevealed(revealId);
}

export const __flowCopyRevealInternals = {
  resetForTests() {
    revealed.clear();
  },
};
