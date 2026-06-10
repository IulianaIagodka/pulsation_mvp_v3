import { flowRevealIds } from "./flow-reveal-ids";
import {
  __flowCopyRevealInternals,
  clearFlowCopyRevealed,
  hasFlowCopyRevealed,
  markFlowCopyRevealed,
  shouldInstantFlowReveal,
} from "./flow-copy-reveal";

describe("flow-copy-reveal", () => {
  afterEach(() => {
    __flowCopyRevealInternals.resetForTests();
  });

  it("remembers revealed copy for the session", () => {
    expect(hasFlowCopyRevealed(flowRevealIds.triggerMain)).toBe(false);
    markFlowCopyRevealed(flowRevealIds.triggerMain);
    expect(hasFlowCopyRevealed(flowRevealIds.triggerMain)).toBe(true);
  });

  it("does not instant-show from session marks alone", () => {
    markFlowCopyRevealed(flowRevealIds.returnMain);
    expect(hasFlowCopyRevealed(flowRevealIds.returnMain)).toBe(true);
    expect(shouldInstantFlowReveal(flowRevealIds.returnMain)).toBe(false);
  });

  it("clears a reveal slot for the next visit", () => {
    markFlowCopyRevealed(flowRevealIds.returnMain);
    clearFlowCopyRevealed(flowRevealIds.returnMain);
    expect(hasFlowCopyRevealed(flowRevealIds.returnMain)).toBe(false);
  });

  it("instant-shows only when forceVisible is set", () => {
    expect(shouldInstantFlowReveal(flowRevealIds.returnMain, true)).toBe(true);
    expect(shouldInstantFlowReveal(flowRevealIds.returnMain, false)).toBe(false);
  });
});
