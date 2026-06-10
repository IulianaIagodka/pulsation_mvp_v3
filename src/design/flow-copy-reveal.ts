/** Persists “already revealed” across navigations within the same app session. */
const revealed = new Set<string>();

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

export const __flowCopyRevealInternals = {
  resetForTests() {
    revealed.clear();
  },
};
