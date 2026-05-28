import { getSpiralHintPresentation } from "../modules/spiral-hint-presentation";

describe("spiral hint progression", () => {
  it("shows fully for early visits", () => {
    const hint = getSpiralHintPresentation(2, 1200, 1);
    expect(hint.shouldShow).toBe(true);
    expect(hint.delayMs).toBe(1200);
    expect(hint.textOpacity).toBe(0.52);
  });

  it("softens and delays in middle range", () => {
    const hint = getSpiralHintPresentation(4, 1000, 0);
    expect(hint.shouldShow).toBe(true);
    expect(hint.delayMs).toBeGreaterThanOrEqual(3200);
    expect(hint.delayMs).toBeLessThanOrEqual(3800);
    expect(hint.textOpacity).toBe(0.38);
  });

  it("shows subtly only sometimes in late range", () => {
    const visible = getSpiralHintPresentation(8, 1000, 0);
    const hidden = getSpiralHintPresentation(9, 1000, 0);

    expect(visible.delayMs).toBe(3800);
    expect(visible.textOpacity).toBe(0.24);
    expect(visible.shouldShow).toBe(true);
    expect(hidden.shouldShow).toBe(false);
  });

  it("disappears for long-term users", () => {
    const hint = getSpiralHintPresentation(20, 800, 1);
    expect(hint.shouldShow).toBe(false);
  });
});
