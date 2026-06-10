jest.mock("./accessibility", () => ({
  getCappedFontScale: (raw = 1) => Math.min(3.1, Math.max(1, raw)),
}));

import { breathingRhythm, circlesLayout } from "./animation-rhythm";
import {
  getCirclesAnchorMetrics,
  getCirclesHintAboveBlockHeight,
  getFlowMainCopyTop,
  getLargestCircleBottomOverflow,
  getMainCopyBelowCirclesGap,
  getMainCopyZoneTop,
  getVisualCirclesBottomY,
} from "./circles-anchor-layout";

describe("circles anchor layout", () => {
  it("reserves overflow through the largest ring at max inhale", () => {
    const width = 390;
    const { size, outerBorderWidth, shadowOffsetY, shadowRadius } = circlesLayout;
    const { scaleInhale } = breathingRhythm.circles;
    const radius = size / 2;
    const expected =
      radius * (scaleInhale - 1) +
      outerBorderWidth / 2 +
      shadowOffsetY +
      shadowRadius +
      6;
    expect(getLargestCircleBottomOverflow(width)).toBeGreaterThanOrEqual(expected - 1);
  });

  it("aligns flow main line Y with extended onboarding", () => {
    const insets = { top: 47, bottom: 34 };
    const metrics = getCirclesAnchorMetrics(844, insets);
    const width = 390;
    const fontScale = 1.2;
    const onboardingTop = getMainCopyZoneTop(metrics, width, fontScale, "above");
    const flowTop = getFlowMainCopyTop(metrics, width, fontScale);
    const triggerLegacyTop = getMainCopyZoneTop(metrics, width, fontScale, "none");

    expect(flowTop).toBe(onboardingTop);
    expect(flowTop).toBeLessThan(triggerLegacyTop);
  });

  it("keeps main copy below visual circles bottom for every hint placement", () => {
    const insets = { top: 47, bottom: 34 };
    const metrics = getCirclesAnchorMetrics(844, insets);
    const width = 390;
    const fontScale = 2.5;

    (["none", "above", "below"] as const).forEach((hintPlacement) => {
      const hintAboveBlock =
        hintPlacement === "above" ? getCirclesHintAboveBlockHeight(width, fontScale) : 0;
      const visualBottom = getVisualCirclesBottomY(metrics, width, hintAboveBlock);
      const mainTop = getMainCopyZoneTop(metrics, width, fontScale, hintPlacement);
      const minGap = getMainCopyBelowCirclesGap(width);
      expect(mainTop - visualBottom).toBeGreaterThanOrEqual(minGap - 1);
    });
  });
});
