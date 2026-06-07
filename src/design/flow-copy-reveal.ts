import { flowRevealIds } from "./flow-reveal-ids";

/** Persists “already revealed” across navigations within the same app session. */
const revealed = new Set<string>();

export function hasFlowCopyRevealed(revealId: string): boolean {
  return revealed.has(revealId);
}

export function markFlowCopyRevealed(revealId: string): void {
  revealed.add(revealId);
}

/** User finished or left the trigger step — skip entrance when they come back from return. */
export function markTriggerFlowRevealed(): void {
  markFlowCopyRevealed(flowRevealIds.triggerMain);
  markFlowCopyRevealed(flowRevealIds.triggerPaths);
  markFlowCopyRevealed(flowRevealIds.triggerCirclesHint);
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
    revealId === flowRevealIds.triggerCirclesHint
  );
}

export function shouldInstantFlowReveal(revealId?: string, forceVisible?: boolean): boolean {
  if (forceVisible) return true;
  if (revealId != null && instantTriggerReturnPending && isTriggerRevealId(revealId)) {
    return true;
  }
  return revealId != null && hasFlowCopyRevealed(revealId);
}

export const __flowCopyRevealInternals = {
  resetForTests() {
    revealed.clear();
  },
};
