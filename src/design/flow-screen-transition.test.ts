import { breathingRhythm, copyReveal } from "./animation-rhythm";
import {
  __flowScreenTransitionInternals,
  armFlowScreenEntryDelay,
  consumeFlowScreenEntryDelayMs,
  getFlowMainCopyDelayMs,
  peekFlowScreenEntryDelayMs,
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

  it("keeps the longest pending entry delay when duplicate transitions arm it", () => {
    armFlowScreenEntryDelay(300);
    armFlowScreenEntryDelay(900);
    armFlowScreenEntryDelay(450);

    expect(peekFlowScreenEntryDelayMs()).toBe(900);
    expect(getFlowMainCopyDelayMs()).toBe(copyReveal.delayMs + 900);
    expect(peekFlowScreenEntryDelayMs()).toBe(0);
  });

  it("ignores invalid or negative entry delays", () => {
    armFlowScreenEntryDelay(-100);
    armFlowScreenEntryDelay(Number.NaN);

    expect(getFlowMainCopyDelayMs()).toBe(copyReveal.delayMs);
  });
});
