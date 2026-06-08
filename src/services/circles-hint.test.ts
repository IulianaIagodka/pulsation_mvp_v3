import {
  CIRCLES_HINT_GRACE_CYCLES,
  getCirclesHintPresentation,
  isLastGraceReturnCycle,
  shouldShowTapHint,
  withLastGraceReturnTapHint,
} from "../modules/circles-hint-presentation";

describe("circles hint progression", () => {
  it("shows until first reveal on any screen", () => {
    const hint = getCirclesHintPresentation(20, 1200, 5, 10, null);
    expect(hint.shouldShow).toBe(true);
    expect(hint.delayMs).toBe(1200);
    expect(hint.textOpacity).toBe(0.48);
  });

  it("stays visible for 2 completed cycles after first reveal", () => {
    expect(shouldShowTapHint(0, 0)).toBe(true);
    expect(shouldShowTapHint(1, 0)).toBe(true);
    expect(shouldShowTapHint(2, 0)).toBe(false);
    expect(shouldShowTapHint(3, 1)).toBe(false);
  });

  it("stops showing after the grace window regardless of tap count", () => {
    const hint = getCirclesHintPresentation(20, 1200, 1, CIRCLES_HINT_GRACE_CYCLES, 0);
    expect(hint.shouldShow).toBe(false);
    expect(hint.textOpacity).toBe(0);
  });

  it("marks only the last grace return for fade-out", () => {
    expect(isLastGraceReturnCycle(0, 0)).toBe(false);
    expect(isLastGraceReturnCycle(1, 0)).toBe(false);
    expect(isLastGraceReturnCycle(2, 0)).toBe(true);
    expect(isLastGraceReturnCycle(3, 1)).toBe(true);
    expect(isLastGraceReturnCycle(0, null)).toBe(false);
  });

  it("keeps tap hint visible on last grace return so it can fade out on You are here", () => {
    const hidden = getCirclesHintPresentation(0, 1200, 0, 2, 0);
    expect(hidden.shouldShow).toBe(false);
    const lastReturn = withLastGraceReturnTapHint(hidden, 2, 0);
    expect(lastReturn.shouldShow).toBe(true);
    expect(lastReturn.textOpacity).toBe(0.48);
  });
});
