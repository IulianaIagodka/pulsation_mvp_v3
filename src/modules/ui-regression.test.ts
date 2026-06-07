import {
  clampFontScale,
  MAX_FONT_SIZE_MULTIPLIER,
  MIN_FONT_SIZE_MULTIPLIER,
} from "../design/accessibility-scale";
import { contentOverflows, getVerticalContentPadding } from "../design/overflow-scroll";
import {
  breathingRhythm,
  copyReveal,
  getFindThreeIntroDelayMs,
  getMainCopyFadeMs,
  getOnboardingCirclesHintDelayMs,
  getOnboardingExplanationDelayMs,
  getOnboardingHowItWorksMountDelayMs,
  getOnboardingLastLineIndex,
  getOnboardingStepLineCycleMs,
  onboardingCopy,
  getTriangleBreathLabelCycleMs,
  getTriangleBreathTotalMs,
  getReturnKeepForMeDelayMs,
  getTriggerPathsLinkDelayMs,
  getTriggerTapHintDelayMs,
  tapHintTiming,
  circlesLayout,
} from "../design/animation-rhythm";

describe("font scale accessibility caps", () => {
  it("keeps a 1.0 floor and XXL ceiling", () => {
    expect(MIN_FONT_SIZE_MULTIPLIER).toBe(1);
    expect(MAX_FONT_SIZE_MULTIPLIER).toBe(3.1);
  });

  it("does not shrink below the app default", () => {
    expect(clampFontScale(0.82)).toBe(1);
    expect(clampFontScale(0.95)).toBe(1);
    expect(clampFontScale(1)).toBe(1);
  });

  it("still grows with larger system text sizes", () => {
    expect(clampFontScale(1.5)).toBe(1.5);
    expect(clampFontScale(3.5)).toBe(3.1);
  });
});

describe("overflow scroll behavior", () => {
  it("enables scroll only when content exceeds the viewport", () => {
    expect(contentOverflows(400, 400)).toBe(false);
    expect(contentOverflows(400, 404)).toBe(false);
    expect(contentOverflows(400, 405)).toBe(true);
    expect(contentOverflows(0, 500)).toBe(false);
  });

  it("counts vertical padding toward scrollable height", () => {
    const padding = getVerticalContentPadding({ paddingBottom: 16, flexGrow: 1 });
    expect(padding).toEqual({ top: 0, bottom: 16 });
    expect(contentOverflows(100, 90 + padding.top + padding.bottom)).toBe(true);
    expect(contentOverflows(100, 80 + padding.top + padding.bottom)).toBe(false);
  });
});

describe("circles layout regression checks", () => {
  it("keeps one shared circles slot size", () => {
    expect(circlesLayout.slotMinHeight).toBe(160);
  });

  it("keeps circles breathing phases stable and ordered", () => {
    const s = breathingRhythm.circles;
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

  it("reveals paths with main copy and tap hint last on trigger", () => {
    expect(getTriggerPathsLinkDelayMs()).toBe(copyReveal.delayMs);
    expect(tapHintTiming.triggerPathsLinkMs).toBe(getTriggerPathsLinkDelayMs());
    expect(tapHintTiming.triggerTapHintMs).toBe(getTriggerTapHintDelayMs());
    expect(tapHintTiming.triggerTapHintMs).toBeGreaterThan(tapHintTiming.triggerPathsLinkMs);
    expect(tapHintTiming.returnTapHintMs).toBeGreaterThan(getReturnKeepForMeDelayMs());
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

  it("keeps extended onboarding copy phases ordered (headline → how it works → hint)", () => {
    const howItWorksMount = getOnboardingHowItWorksMountDelayMs();
    const subtitle = getOnboardingExplanationDelayMs(0);
    const lastStep = getOnboardingExplanationDelayMs(getOnboardingLastLineIndex(4));
    const hint = getOnboardingCirclesHintDelayMs(4);

    expect(onboardingCopy.headlineHoldMs).toBeGreaterThanOrEqual(1200);
    expect(getOnboardingStepLineCycleMs()).toBeGreaterThan(onboardingCopy.stepFadeMs);
    expect(subtitle).toBe(howItWorksMount);
    expect(lastStep).toBe(howItWorksMount + getOnboardingStepLineCycleMs() * 4);
    expect(hint).toBe(
      lastStep + onboardingCopy.stepFadeMs + onboardingCopy.stepReadMs + onboardingCopy.hintGapMs,
    );
  });
});
