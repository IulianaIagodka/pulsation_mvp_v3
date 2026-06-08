import { breathingRhythm, copyReveal } from "./animation-rhythm";
import {
  __flowScreenTransitionInternals,
  armFlowScreenEntryDelay,
  consumeFlowScreenEntryDelayMs,
  getFlowMainCopyDelayMs,
} from "./flow-screen-transition";

describe("flow-screen-transition", () => {
  beforeEach(() => {
    __flowScreenTransitionInternals.resetForTests();
  });

  it("adds exit fade to the next screen main copy delay once", () => {
    armFlowScreenEntryDelay();
    expect(getFlowMainCopyDelayMs()).toBe(copyReveal.delayMs + breathingRhythm.motion.screenFadeMs);
    expect(getFlowMainCopyDelayMs()).toBe(copyReveal.delayMs);
    expect(consumeFlowScreenEntryDelayMs()).toBe(0);
  });
});
