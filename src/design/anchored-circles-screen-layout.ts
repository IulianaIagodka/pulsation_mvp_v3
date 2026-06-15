import { getCappedFontScale } from "./accessibility";
import {
  type CirclesAnchorMetrics,
  getCirclesAnchorMetrics,
  getFollowUpContentLayout,
  getFlowMainCopyTop,
  getMainCopySlotHeight,
  getReturnFollowUpTop,
  getScreenEquatorY,
} from "./circles-anchor-layout";
import { clamp, scaleByWidth } from "./responsive";
import { spacing } from "./tokens";

type Insets = { top: number; bottom: number };

export type AnchoredCirclesScreenLayoutOptions = {
  windowHeight: number;
  windowWidth: number;
  insets: Insets;
  fontScale?: number;
  footerLinkCount?: number;
  centerContent?: boolean;
  compactCapture?: boolean;
  pinMainLikeTrigger?: boolean;
  expandMainToFooter?: boolean;
  hasMainLine?: boolean;
  hasPinnedAfterMain?: boolean;
  hasBelowEquator?: boolean;
};

export type AnchoredCirclesScreenLayout = {
  metrics: CirclesAnchorMetrics;
  footerBottomInset: number;
  footerRowHeight: number;
  footerHeight: number;
  scrollBottomPad: number;
  flowMainCopyTop: number;
  contentZoneTop: number;
  triggerMainCopyTop: number;
  mainCopySlotHeight: number;
  screenEquatorY: number;
  belowEquatorTop: number;
  useEquatorLayout: boolean;
  afterMainTop: number;
  unifiedMainScroll: boolean;
  mainOnlyScroll: boolean;
  mainBandScroll: boolean;
  hasFollowUpBelowMain: boolean;
  mainZoneBottom: number;
  pinnedMainTop: number;
  mainClampHeight?: number;
  scrollBelowMainTop: number;
  scrollBelowMainBottom: number;
};

export function getAnchoredCirclesScreenLayout({
  windowHeight,
  windowWidth,
  insets,
  fontScale = getCappedFontScale(),
  footerLinkCount = 0,
  centerContent = true,
  compactCapture = false,
  pinMainLikeTrigger = false,
  expandMainToFooter = false,
  hasMainLine = false,
  hasPinnedAfterMain = false,
  hasBelowEquator = false,
}: AnchoredCirclesScreenLayoutOptions): AnchoredCirclesScreenLayout {
  const metrics = getCirclesAnchorMetrics(windowHeight, insets);
  const footerBottomInset = Math.max(insets.bottom, scaleByWidth(spacing.sm, windowWidth));
  const footerRowHeight = clamp(scaleByWidth(44, windowWidth) * fontScale, 44, 132);
  const footerHeight =
    footerLinkCount > 0
      ? footerRowHeight * footerLinkCount + scaleByWidth(spacing.xs, windowWidth)
      : 0;
  const scrollBottomPad =
    footerLinkCount > 0 ? footerHeight + footerBottomInset : scaleByWidth(spacing.xl, windowWidth);
  const flowMainCopyTop = getFlowMainCopyTop(metrics, windowWidth, fontScale);
  const contentZoneTop = compactCapture
    ? metrics.circlesBottomY + scaleByWidth(spacing.xs, windowWidth)
    : flowMainCopyTop;
  const triggerMainCopyTop =
    pinMainLikeTrigger && !compactCapture ? flowMainCopyTop : contentZoneTop;
  const mainCopySlotHeight = getMainCopySlotHeight(windowWidth, fontScale);
  const screenEquatorY = getScreenEquatorY(windowHeight, insets);
  const belowEquatorTop = pinMainLikeTrigger
    ? getReturnFollowUpTop(metrics, windowWidth, fontScale)
    : screenEquatorY + scaleByWidth(36, windowWidth) * fontScale;
  const useEquatorLayout = centerContent && pinMainLikeTrigger;
  const afterMainTop = triggerMainCopyTop + mainCopySlotHeight;
  const unifiedMainScroll =
    pinMainLikeTrigger &&
    hasMainLine &&
    hasPinnedAfterMain &&
    !hasBelowEquator &&
    !expandMainToFooter;
  const mainOnlyScroll =
    pinMainLikeTrigger &&
    hasMainLine &&
    !hasPinnedAfterMain &&
    !hasBelowEquator &&
    !expandMainToFooter;
  const mainBandScroll = mainOnlyScroll || unifiedMainScroll;
  const hasFollowUpBelowMain = hasPinnedAfterMain || hasBelowEquator;
  const mainZoneBottom =
    footerLinkCount > 0 ? footerHeight + footerBottomInset : scaleByWidth(spacing.sm, windowWidth);
  const followUpLayout = hasFollowUpBelowMain
    ? getFollowUpContentLayout(windowHeight, insets, windowWidth, fontScale, mainZoneBottom)
    : null;
  const pinnedMainTop = followUpLayout?.mainTop ?? triggerMainCopyTop;

  return {
    metrics,
    footerBottomInset,
    footerRowHeight,
    footerHeight,
    scrollBottomPad,
    flowMainCopyTop,
    contentZoneTop,
    triggerMainCopyTop,
    mainCopySlotHeight,
    screenEquatorY,
    belowEquatorTop,
    useEquatorLayout,
    afterMainTop,
    unifiedMainScroll,
    mainOnlyScroll,
    mainBandScroll,
    hasFollowUpBelowMain,
    mainZoneBottom,
    pinnedMainTop,
    mainClampHeight: followUpLayout?.mainClampHeight,
    scrollBelowMainTop: followUpLayout?.scrollTop ?? belowEquatorTop,
    scrollBelowMainBottom: followUpLayout?.scrollBottom ?? mainZoneBottom,
  };
}
