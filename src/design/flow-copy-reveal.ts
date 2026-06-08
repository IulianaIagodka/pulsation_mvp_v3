import { flowRevealIds } from "./flow-reveal-ids";

/** Persists “already revealed” across navigations within the same app session. */
const revealed = new Set<string>();

export function hasFlowCopyRevealed(revealId: string): boolean {
  return revealed.has(revealId);
}

export function markFlowCopyShown(revealId: string): void {
  revealed.add(revealId);
}

export function markFlowCopyRevealed(revealId: string): void {
  markFlowCopyShown(revealId);
}

/** User finished or left the trigger step — skip entrance when they come back from return. */
export function markTriggerFlowRevealed(): void {
  markFlowCopyRevealed(flowRevealIds.triggerMain);
  markFlowCopyRevealed(flowRevealIds.triggerPaths);
}

/** Call right before navigating return → trigger (same tick as markTriggerFlowRevealed). */
export function armInstantTriggerReturn(): void {
  markTriggerFlowRevealed();
}

export function shouldInstantFlowReveal(revealId?: string, forceVisible?: boolean): boolean {
  if (forceVisible) return true;
  if (revealId === flowRevealIds.triggerPaths || revealId === flowRevealIds.triggerMain) {
    return false;
  }
  return revealId != null && hasFlowCopyRevealed(revealId);
}

export const __flowCopyRevealInternals = {
  resetForTests() {
    revealed.clear();
  },
};
