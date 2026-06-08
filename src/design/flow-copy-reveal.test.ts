import { flowRevealIds } from "./flow-reveal-ids";
import { recordTapHintRevealedAtCycle } from "../data/repositories/scheduling-profile-repo";
import {
  __flowCopyRevealInternals,
  armInstantTriggerReturn,
  clearInstantTriggerReturn,
  hasFlowCopyRevealed,
  isInstantTriggerReturnActive,
  dismissFlowCirclesHint,
  markFlowCopyRevealed,
  markFlowCopyShown,
  markTriggerFlowRevealed,
  shouldInstantFlowReveal,
} from "./flow-copy-reveal";

jest.mock("../data/repositories/scheduling-profile-repo", () => ({
  recordTapHintRevealedAtCycle: jest.fn(),
}));

describe("flow-copy-reveal", () => {
  afterEach(() => {
    __flowCopyRevealInternals.resetForTests();
    clearInstantTriggerReturn();
    jest.clearAllMocks();
  });

  it("anchors tap hint grace when flow circles hint is first shown", () => {
    markFlowCopyShown(flowRevealIds.flowCirclesHint);
    expect(hasFlowCopyRevealed(flowRevealIds.flowCirclesHint)).toBe(true);
    expect(recordTapHintRevealedAtCycle).toHaveBeenCalledTimes(1);
  });

  it("records tap hint grace when flow circles hint is revealed", () => {
    markFlowCopyRevealed(flowRevealIds.flowCirclesHint);
    expect(recordTapHintRevealedAtCycle).toHaveBeenCalledTimes(1);
  });

  it("remembers revealed copy for the session", () => {
    expect(hasFlowCopyRevealed("trigger-main")).toBe(false);
    markFlowCopyRevealed("trigger-main");
    expect(hasFlowCopyRevealed("trigger-main")).toBe(true);
  });

  it("marks trigger copy slots but not tap hint when the user leaves the flow step", () => {
    markTriggerFlowRevealed();
    expect(hasFlowCopyRevealed(flowRevealIds.triggerMain)).toBe(true);
    expect(hasFlowCopyRevealed(flowRevealIds.triggerPaths)).toBe(true);
    expect(hasFlowCopyRevealed(flowRevealIds.flowCirclesHint)).toBe(false);
  });

  it("instant trigger return skips tap hint until it has been revealed once", () => {
    armInstantTriggerReturn();
    expect(shouldInstantFlowReveal(flowRevealIds.flowCirclesHint)).toBe(false);
    markFlowCopyRevealed(flowRevealIds.flowCirclesHint);
    expect(shouldInstantFlowReveal(flowRevealIds.flowCirclesHint)).toBe(true);
  });

  it("does not instant-show tap hint from session alone off trigger return", () => {
    markFlowCopyShown(flowRevealIds.flowCirclesHint);
    expect(shouldInstantFlowReveal(flowRevealIds.flowCirclesHint)).toBe(false);
  });

  it("does not instant-show paths from session alone off trigger return", () => {
    markFlowCopyRevealed(flowRevealIds.triggerPaths);
    expect(shouldInstantFlowReveal(flowRevealIds.triggerPaths)).toBe(false);
  });

  it("does not instant-show trigger main from session alone off trigger return", () => {
    markFlowCopyRevealed(flowRevealIds.triggerMain);
    expect(shouldInstantFlowReveal(flowRevealIds.triggerMain)).toBe(false);
  });

  it("instant trigger return shows paths when already revealed", () => {
    markFlowCopyRevealed(flowRevealIds.triggerPaths);
    armInstantTriggerReturn();
    expect(shouldInstantFlowReveal(flowRevealIds.triggerPaths)).toBe(true);
  });

  it("clears tap hint session after grace dismiss", () => {
    markFlowCopyShown(flowRevealIds.flowCirclesHint);
    dismissFlowCirclesHint();
    expect(hasFlowCopyRevealed(flowRevealIds.flowCirclesHint)).toBe(false);
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
