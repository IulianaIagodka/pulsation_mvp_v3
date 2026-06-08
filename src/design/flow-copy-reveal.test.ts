import { flowRevealIds } from "./flow-reveal-ids";
import { recordTapHintRevealedAtCycle } from "../data/repositories/scheduling-profile-repo";
import {
  __flowCopyRevealInternals,
  armInstantTriggerReturn,
  clearInstantTriggerReturn,
  dismissFlowCirclesHint,
  getHintSessionEpoch,
  hasFlowCopyRevealed,
  isInstantTriggerReturnActive,
  markFlowCopyRevealed,
  markFlowCopyShown,
  markTriggerFlowRevealed,
  shouldInstantFlowReveal,
  subscribeHintSession,
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

  it("instant trigger return only snap-shows tap hint after it has been revealed once", () => {
    armInstantTriggerReturn();
    expect(shouldInstantFlowReveal(flowRevealIds.triggerMain)).toBe(false);
    expect(shouldInstantFlowReveal(flowRevealIds.triggerPaths)).toBe(false);
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

  it("does not instant-show paths on trigger return even when already revealed", () => {
    markFlowCopyRevealed(flowRevealIds.triggerPaths);
    armInstantTriggerReturn();
    expect(shouldInstantFlowReveal(flowRevealIds.triggerPaths)).toBe(false);
  });

  it("clears tap hint session after grace dismiss", () => {
    markFlowCopyShown(flowRevealIds.flowCirclesHint);
    dismissFlowCirclesHint();
    expect(hasFlowCopyRevealed(flowRevealIds.flowCirclesHint)).toBe(false);
  });

  it("notifies hint session subscribers when tap hint is shown or dismissed", () => {
    const epochs: number[] = [];
    const unsubscribe = subscribeHintSession(() => {
      epochs.push(getHintSessionEpoch());
    });

    markFlowCopyShown(flowRevealIds.flowCirclesHint);
    dismissFlowCirclesHint();
    unsubscribe();

    expect(epochs).toEqual([1, 2]);
  });

  it("arms instant trigger return for tap hint persistence only", () => {
    armInstantTriggerReturn();
    expect(isInstantTriggerReturnActive()).toBe(true);
    expect(shouldInstantFlowReveal(flowRevealIds.triggerMain)).toBe(false);
    expect(shouldInstantFlowReveal("other-copy")).toBe(false);
    clearInstantTriggerReturn();
    expect(isInstantTriggerReturnActive()).toBe(false);
  });
});
