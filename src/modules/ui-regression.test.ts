import {
  breathingRhythm,
  copyReveal,
  getFindThreeIntroDelayMs,
  getMainCopyFadeMs,
  getTriangleBreathLabelCycleMs,
  getTriangleBreathTotalMs,
  spiralLayout,
} from "../design/animation-rhythm";

describe("spiral layout regression checks", () => {
  it("keeps one shared spiral slot size", () => {
    expect(spiralLayout.slotMinHeight).toBe(160);
  });

  it("keeps spiral breathing phases stable and ordered", () => {
    const s = breathingRhythm.spiral;
    expect(s.inhaleMs).toBeGreaterThan(0);
    expect(s.holdMs).toBeGreaterThan(0);
    expect(s.exhaleMs).toBeGreaterThan(s.inhaleMs);
    expect(s.postExhaleHoldMs).toBeGreaterThan(0);
    expect(s.postExhaleHoldMs).toBeLessThan(s.inhaleMs);
    expect(s.scaleInhale).toBeGreaterThan(s.scaleExhale);
    expect(s.opacityInhale).toBeGreaterThan(s.opacityExhale);
  });

  it("keeps find-three-things intro before bullets and auto-reveal calm", () => {
    expect(getFindThreeIntroDelayMs()).toBeGreaterThan(2000);
    expect(breathingRhythm.findThreeThings.autoRevealIntervalMs).toBe(2000);
    expect(breathingRhythm.findThreeThings.revealDurationMs).toBeGreaterThan(0);
  });

  it("keeps one shared copy reveal rhythm (fast, smooth)", () => {
    expect(copyReveal.delayMs).toBeGreaterThanOrEqual(breathingRhythm.motion.screenFadeMs);
    expect(copyReveal.fadeMs).toBeGreaterThan(1000);
    expect(copyReveal.fadeMs).toBeLessThanOrEqual(2200);
    expect(breathingRhythm.explanationText.fadeMs).toBe(copyReveal.fadeMs);
    expect(getMainCopyFadeMs()).toBe(copyReveal.fadeMs);
    expect(breathingRhythm.explanationText.textOpacity).toBeLessThanOrEqual(0.6);
    expect(getFindThreeIntroDelayMs()).toBeGreaterThan(copyReveal.delayMs + copyReveal.fadeMs);
  });

  it("keeps triangle breath cycle at 4-2-5 seconds for 3 cycles", () => {
    const t = breathingRhythm.triangleBreath;
    expect(t.cycles).toBe(3);
    expect(t.inhaleMs).toBe(4000);
    expect(t.holdMs).toBe(2000);
    expect(t.exhaleMs).toBe(5000);
    expect(t.inhaleMs + t.holdMs + t.exhaleMs).toBe(11000);
    expect(t.labelFadeMs).toBeGreaterThan(0);
    expect(getTriangleBreathLabelCycleMs()).toBe(11000);
    expect(getTriangleBreathTotalMs()).toBe(33000);
  });
});
