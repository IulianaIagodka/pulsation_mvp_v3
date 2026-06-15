import {
  clampFontScale,
  MAX_FONT_SIZE_MULTIPLIER,
  MIN_FONT_SIZE_MULTIPLIER,
} from "../design/accessibility-scale";
import { contentOverflows, getVerticalContentPadding, shouldShowScrollOverflowHint } from "../design/overflow-scroll";
import { getFlowCopyTextWidth, getFlowScreenHorizontalInset } from "../design/responsive";
import {
  breathingRhythm,
  copyReveal,
  getFindThreeBulletsStartDelayMs,
  getMainCopyFadeMs,
  getOnboardingExplanationDelayMs,
  getOnboardingHowItWorksMountDelayMs,
  getOnboardingLastLineIndex,
  getOnboardingStepLineCycleMs,
  onboardingCopy,
  getFlowCopyTimeline,
  getTriangleBreathLabelCycleMs,
  getTriangleBreathIntroDelayMs,
  getTriangleBreathTotalMs,
  getAuxiliaryCopyDelayMs,
  getMainCopyDelayMs,
  getReturnExplanationDelayMs,
  getReturnKeepForMeAfterExplanationMs,
  getReturnKeepForMeDelayMs,
  returnCopy,
  getTriggerPathsLinkDelayMs,
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

describe("flow copy width", () => {
  it("subtracts safe-area insets and flow screen horizontal padding for wrapping", () => {
    expect(getFlowScreenHorizontalInset(390)).toBe(78);
    expect(getFlowCopyTextWidth(390, { left: 0, right: 0 })).toBe(312);
    expect(getFlowCopyTextWidth(390, { left: 12, right: 12 })).toBe(288);
    expect(getFlowCopyTextWidth(390, { left: 0, right: 0 }, 20)).toBe(370);
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

  it("shows a bottom scroll hint until the user reaches the end", () => {
    expect(shouldShowScrollOverflowHint(true, 0, 400, 500)).toBe(true);
    expect(shouldShowScrollOverflowHint(true, 95, 400, 500)).toBe(true);
    expect(shouldShowScrollOverflowHint(true, 96, 400, 500)).toBe(false);
    expect(shouldShowScrollOverflowHint(false, 0, 400, 500)).toBe(false);
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
    expect(getFindThreeBulletsStartDelayMs()).toBeGreaterThan(2000);
    expect(breathingRhythm.findThreeThings.autoRevealIntervalMs).toBe(2000);
    expect(breathingRhythm.findThreeThings.revealDurationMs).toBeGreaterThan(0);
  });

  it("reveals paths link with main copy on trigger", () => {
    expect(getTriggerPathsLinkDelayMs()).toBe(copyReveal.delayMs);
  });

  it("keeps return tap-revealed explanation timing after You are here", () => {
    expect(getReturnKeepForMeAfterExplanationMs()).toBe(
      copyReveal.lineGapMs - returnCopy.explanationGapMs,
    );
  });

  it("keeps one shared copy reveal rhythm (fast, smooth)", () => {
    expect(copyReveal.delayMs).toBeGreaterThanOrEqual(breathingRhythm.motion.screenFadeMs);
    expect(copyReveal.fadeMs).toBeGreaterThan(1000);
    expect(copyReveal.fadeMs).toBeLessThanOrEqual(2200);
    expect(breathingRhythm.explanationText.fadeMs).toBe(copyReveal.fadeMs);
    expect(getMainCopyFadeMs()).toBe(copyReveal.fadeMs);
    expect(breathingRhythm.explanationText.textOpacity).toBeLessThan(1);
    expect(breathingRhythm.explanationText.textOpacity).toBeGreaterThanOrEqual(0.72);
    expect(getFindThreeBulletsStartDelayMs()).toBeGreaterThan(copyReveal.delayMs + copyReveal.fadeMs);
  });

  it("keeps the flow copy timeline ordered after route fade", () => {
    const entryDelayMs = breathingRhythm.motion.screenFadeMs;
    const timeline = getFlowCopyTimeline(entryDelayMs);

    expect(timeline.mainDelayMs).toBe(copyReveal.delayMs + entryDelayMs);
    expect(timeline.mainRevealedMs).toBe(timeline.mainDelayMs + copyReveal.fadeMs);
    expect(timeline.returnExplanationDelayMs).toBe(
      timeline.mainRevealedMs + returnCopy.explanationGapMs,
    );
    expect(timeline.auxiliaryDelayMs).toBe(timeline.mainRevealedMs + copyReveal.lineGapMs);
    expect(timeline.returnExplanationDelayMs).toBeLessThan(timeline.returnKeepForMeDelayMs);
    expect(timeline.returnKeepForMeDelayMs).toBe(timeline.auxiliaryDelayMs);
    expect(timeline.findThreeBulletsStartDelayMs).toBe(timeline.auxiliaryDelayMs);
    expect(timeline.triangleBreathIntroDelayMs).toBe(timeline.auxiliaryDelayMs);
    expect(timeline.triggerPathsDelayMs).toBe(timeline.mainDelayMs);
  });

  it("keeps individual timing helpers backed by the same timeline", () => {
    const entryDelayMs = breathingRhythm.motion.screenFadeMs;
    const timeline = getFlowCopyTimeline(entryDelayMs);
    const mainDelayMs = getMainCopyDelayMs() + entryDelayMs;

    expect(getReturnExplanationDelayMs(mainDelayMs)).toBe(timeline.returnExplanationDelayMs);
    expect(getReturnKeepForMeDelayMs(mainDelayMs)).toBe(timeline.returnKeepForMeDelayMs);
    expect(getAuxiliaryCopyDelayMs(mainDelayMs)).toBe(timeline.auxiliaryDelayMs);
    expect(getFindThreeBulletsStartDelayMs(mainDelayMs)).toBe(
      timeline.findThreeBulletsStartDelayMs,
    );
    expect(getTriangleBreathIntroDelayMs(mainDelayMs)).toBe(timeline.triangleBreathIntroDelayMs);
    expect(getTriggerPathsLinkDelayMs(mainDelayMs)).toBe(timeline.triggerPathsDelayMs);
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

  it("keeps extended onboarding copy phases ordered (headline + hint, auto or tap how it works)", () => {
    const howItWorksMount = getOnboardingHowItWorksMountDelayMs();
    const subtitle = getOnboardingExplanationDelayMs(0);
    const stepCount = 3;
    const lastStep = getOnboardingExplanationDelayMs(getOnboardingLastLineIndex(stepCount));

    expect(onboardingCopy.headlineHoldMs).toBeGreaterThanOrEqual(1200);
    expect(getOnboardingStepLineCycleMs()).toBeGreaterThan(onboardingCopy.stepFadeMs);
    expect(howItWorksMount).toBe(
      copyReveal.delayMs + copyReveal.fadeMs + onboardingCopy.headlineHoldMs,
    );
    expect(subtitle).toBe(howItWorksMount);
    expect(lastStep).toBe(howItWorksMount + getOnboardingStepLineCycleMs() * stepCount);
  });
});
