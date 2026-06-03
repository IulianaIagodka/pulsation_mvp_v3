import {
  SPIRAL_HINT_FULL_CYCLES,
  getSpiralHintPresentation,
} from "../modules/spiral-hint-presentation";

describe("spiral hint progression", () => {
  it("shows on every screen during the first 3 completed cycles", () => {
    const hint = getSpiralHintPresentation(20, 1200, 5, SPIRAL_HINT_FULL_CYCLES - 1);
    expect(hint.shouldShow).toBe(true);
    expect(hint.delayMs).toBe(1200);
    expect(hint.textOpacity).toBe(0.58);
  });

  it("stops showing after 3 completed cycles regardless of tap count", () => {
    const hint = getSpiralHintPresentation(2, 1200, 1, SPIRAL_HINT_FULL_CYCLES);
    expect(hint.shouldShow).toBe(false);
    expect(hint.textOpacity).toBe(0);
  });

  it("stays hidden for long-term users", () => {
    const hint = getSpiralHintPresentation(20, 800, 1, SPIRAL_HINT_FULL_CYCLES + 4);
    expect(hint.shouldShow).toBe(false);
  });
});
