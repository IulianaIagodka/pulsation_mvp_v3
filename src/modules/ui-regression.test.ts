import { breathingRhythm, spiralLayout } from "../design/animation-rhythm";

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

  it("keeps triangle breathing fade and hold timings positive", () => {
    expect(breathingRhythm.triangleBreath.fadeDurationMs).toBeGreaterThan(0);
    expect(breathingRhythm.triangleBreath.visibleDurationMs).toBeGreaterThan(0);
    expect(breathingRhythm.triangleBreath.holdBridgeDelayMs).toBeGreaterThan(0);
  });
});
