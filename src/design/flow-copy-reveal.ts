/** Persists “already revealed” across navigations within the same app session. */
const revealed = new Set<string>();

export type FlowCopyRevealSnapshot = {
  revealedIds: string[];
};

export function hasFlowCopyRevealed(revealId: string): boolean {
  return revealed.has(revealId);
}

export function markFlowCopyRevealed(revealId: string): void {
  revealed.add(revealId);
}

export function clearFlowCopyRevealed(revealId: string): void {
  revealed.delete(revealId);
}

export function shouldInstantFlowReveal(_revealId?: string, forceVisible?: boolean): boolean {
  return forceVisible === true;
}

export function getFlowCopyRevealSnapshot(): FlowCopyRevealSnapshot {
  return { revealedIds: Array.from(revealed).sort() };
}

export function resetFlowCopyRevealSession(): void {
  revealed.clear();
}

export const __flowCopyRevealInternals = {
  resetForTests() {
    resetFlowCopyRevealSession();
  },
};
