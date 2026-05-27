import { breathingRhythm, getTriangleBreathLabelCycleMs, getTriangleBreathTotalMs, spiralLayout } from "../design/animation-rhythm";

describe("spiral layout regression checks", () => {
  it("keeps one shared spiral slot size", () => {
    expect(spiralLayout.slotMinHeight).toBe(160);
  });

  it("keeps spiral breathing phases stable and ordered", () => {
    expect(breathingRhythm.spiral.inhaleMs).toBeGreaterThan(0);
    expect(breathingRhythm.spiral.holdMs).toBeGreaterThan(0);
    expect(breathingRhythm.spiral.exhaleMs).toBeGreaterThan(0);
    expect(breathingRhythm.spiral.scaleInhale).toBeGreaterThan(breathingRhythm.spiral.scaleExhale);
  });

  it("keeps find-three-things reveal delays increasing", () => {
    const [first, second, third] = breathingRhythm.findThreeThings.revealDelayMs;
    expect(first).toBeGreaterThan(0);
    expect(second).toBeGreaterThan(first);
    expect(third).toBeGreaterThan(second);
  });

  it("keeps explanation text reveal timing calm and delayed", () => {
    const e = breathingRhythm.explanationText;
    expect(e.secondaryDelayMs).toBeGreaterThanOrEqual(2000);
    expect(e.secondaryDelayMs).toBeLessThanOrEqual(3000);
    expect(e.fadeMs).toBeGreaterThan(1000);
    expect(e.textOpacity).toBeLessThanOrEqual(0.6);
  });

  it("keeps triangle breath cycle at 4-2-5-2 seconds for 3 cycles", () => {
    const t = breathingRhythm.triangleBreath;
    expect(t.cycles).toBe(3);
    expect(t.inhaleMs).toBe(4000);
    expect(t.holdMs).toBe(2000);
    expect(t.exhaleMs).toBe(5000);
    expect(t.holdAfterExhaleMs).toBe(2000);
    expect(t.inhaleMs + t.holdMs + t.exhaleMs + t.holdAfterExhaleMs).toBe(13000);
    expect(t.labelFadeMs).toBeGreaterThan(0);
    expect(getTriangleBreathLabelCycleMs()).toBe(13000);
    expect(getTriangleBreathTotalMs()).toBe(39000);
  });
});
