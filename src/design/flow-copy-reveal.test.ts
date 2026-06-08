import { flowRevealIds } from "./flow-reveal-ids";
import {
  __flowCopyRevealInternals,
  armInstantTriggerReturn,
  hasFlowCopyRevealed,
  markFlowCopyRevealed,
  markFlowCopyShown,
  markTriggerFlowRevealed,
  shouldInstantFlowReveal,
} from "./flow-copy-reveal";

describe("flow-copy-reveal", () => {
  afterEach(() => {
    __flowCopyRevealInternals.resetForTests();
  });

  it("remembers revealed copy for the session", () => {
    expect(hasFlowCopyRevealed("trigger-main")).toBe(false);
    markFlowCopyRevealed("trigger-main");
    expect(hasFlowCopyRevealed("trigger-main")).toBe(true);
  });

  it("marks trigger copy slots when the user leaves the flow step", () => {
    markTriggerFlowRevealed();
    expect(hasFlowCopyRevealed(flowRevealIds.triggerMain)).toBe(true);
    expect(hasFlowCopyRevealed(flowRevealIds.triggerPaths)).toBe(true);
  });

  it("does not instant-show trigger copy from session alone", () => {
    markFlowCopyRevealed(flowRevealIds.triggerMain);
    expect(shouldInstantFlowReveal(flowRevealIds.triggerMain)).toBe(false);
    markFlowCopyRevealed(flowRevealIds.triggerPaths);
    expect(shouldInstantFlowReveal(flowRevealIds.triggerPaths)).toBe(false);
  });

  it("instant-shows return main after it has been revealed once", () => {
    markFlowCopyShown(flowRevealIds.returnMain);
    expect(shouldInstantFlowReveal(flowRevealIds.returnMain)).toBe(true);
  });

  it("arms trigger flow reveal before navigating back to trigger", () => {
    armInstantTriggerReturn();
    expect(hasFlowCopyRevealed(flowRevealIds.triggerMain)).toBe(true);
    expect(hasFlowCopyRevealed(flowRevealIds.triggerPaths)).toBe(true);
    expect(shouldInstantFlowReveal(flowRevealIds.triggerMain)).toBe(false);
  });
});
