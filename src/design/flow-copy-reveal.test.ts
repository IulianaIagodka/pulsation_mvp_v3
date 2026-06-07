import { flowRevealIds } from "./flow-reveal-ids";
import {
  __flowCopyRevealInternals,
  armInstantTriggerReturn,
  clearInstantTriggerReturn,
  hasFlowCopyRevealed,
  isInstantTriggerReturnActive,
  markFlowCopyRevealed,
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

  it("marks all trigger copy slots when the user leaves the flow step", () => {
    markTriggerFlowRevealed();
    expect(hasFlowCopyRevealed(flowRevealIds.triggerMain)).toBe(true);
    expect(hasFlowCopyRevealed(flowRevealIds.triggerPaths)).toBe(true);
    expect(hasFlowCopyRevealed(flowRevealIds.triggerCirclesHint)).toBe(true);
  });

  it("arms instant trigger return only for trigger reveal ids", () => {
    armInstantTriggerReturn();
    expect(isInstantTriggerReturnActive()).toBe(true);
    expect(shouldInstantFlowReveal(flowRevealIds.triggerMain)).toBe(true);
    expect(shouldInstantFlowReveal("other-copy")).toBe(false);
    clearInstantTriggerReturn();
    expect(isInstantTriggerReturnActive()).toBe(false);
  });
});
