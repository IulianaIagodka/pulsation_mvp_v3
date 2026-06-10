import { PropsWithChildren, ReactNode, useCallback } from "react";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { getCappedFontScale } from "../accessibility";
import { useStableLayoutInsets } from "../../hooks/use-stable-layout-insets";
import { useStableWindowDimensions } from "../../hooks/use-stable-window-dimensions";
import { circlesLayout } from "../animation-rhythm";
import { spacing } from "../tokens";
import { CalmPressable } from "./CalmPressable";
import { resolvePressableTextOpacity } from "../pressable-highlight";
import { clamp, scaleByWidth } from "../responsive";
import {
  getCirclesAnchorMetrics,
  getFollowUpContentLayout,
  getFlowMainCopyTop,
  getMainCopySlotHeight,
  getReturnFollowUpTop,
  getScreenEquatorY,
} from "../circles-anchor-layout";
import { useAppStore } from "../../state/app-store";
import { uiCopy } from "../../modules/delivery-layer";
import { resetPulsationLocalData } from "../../services/pulsation-flow";
import { AboutFooterLink } from "./AboutFooterLink";
import { flowRevealIds } from "../flow-reveal-ids";
import { FooterRevealLink } from "./FooterRevealLink";
import { CalmText } from "./CalmText";
import { CalmScreen } from "./CalmScreen";
import { OverflowScrollView } from "./OverflowScrollView";
import { SoftCard } from "./SoftCard";

type Props = PropsWithChildren<{
  /** Omit when circles are rendered by `PersistentCirclesLayer` in the root layout. */
  circles?: ReactNode;
  /** Primary main line — pinned alone so hint / bullets never shift its Y. */
  mainLine?: ReactNode;
  /** Place main copy on the vertical screen equator (default). Set false for scroll-only layouts. */
  centerContent?: boolean;
  /** Optional copy below the equator main line (e.g. return follow-up). */
  belowEquator?: ReactNode;
  /** Pinned to the bottom of the screen (e.g. About link on onboarding). */
  footer?: ReactNode;
  /**
   * Pin main copy at the shared flow main-line Y.
   * Return / onboarding — keeps follow-up from shifting the main line.
   */
  pinMainLikeTrigger?: boolean;
  /** Show “Show my paths” in the footer (trigger / “one action” screen only). */
  showPathsLink?: boolean;
  /** Fade in paths link together with main copy (trigger). */
  pathsLinkRevealDelayMs?: number;
  /** Remount paths link on trigger refocus so it replays after main copy. */
  pathsLinkRevealKey?: number | string;
  /** Tighter scroll top for App Store capture (full extended onboarding on one screen). */
  compactCapture?: boolean;
  /** Stretch main slot to the footer and vertically center its content (onboarding). */
  expandMainToFooter?: boolean;
}>;

export function AnchoredCirclesScreen({
  circles,
  mainLine,
  children,
  centerContent = true,
  belowEquator,
  footer,
  showPathsLink = false,
  pathsLinkRevealDelayMs,
  pathsLinkRevealKey,
  compactCapture = false,
  pinMainLikeTrigger = false,
  expandMainToFooter = false,
}: Props) {
  const router = useRouter();
  const insets = useStableLayoutInsets();
  const { height: windowHeight, width: windowWidth } = useStableWindowDimensions();
  const fontScale = getCappedFontScale();
  const highContrastPreviewEnabled = useAppStore((s) => s.highContrastPreviewEnabled);
  const setHighContrastPreviewEnabled = useAppStore((s) => s.setHighContrastPreviewEnabled);
  const clearIntervention = useAppStore((s) => s.clearIntervention);

  const onDevResetLocalData = useCallback(() => {
    resetPulsationLocalData();
    clearIntervention();
    router.replace("/");
  }, [clearIntervention, router]);

  const metrics = getCirclesAnchorMetrics(windowHeight, insets);
  const footerBottomInset = Math.max(insets.bottom, scaleByWidth(spacing.sm, windowWidth));
  const footerLinkCount = (showPathsLink ? 1 : 0) + (footer ? 1 : 0);
  const footerRowHeight = clamp(scaleByWidth(44, windowWidth) * fontScale, 44, 132);
  const footerHeight = footerLinkCount > 0 ? footerRowHeight * footerLinkCount + scaleByWidth(spacing.xs, windowWidth) : 0;
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
  const pinnedAfterMain = mainLine != null ? children : null;
  const unifiedMainScroll =
    pinMainLikeTrigger &&
    mainLine != null &&
    pinnedAfterMain != null &&
    belowEquator == null &&
    !expandMainToFooter;
  const mainOnlyScroll =
    pinMainLikeTrigger &&
    mainLine != null &&
    pinnedAfterMain == null &&
    belowEquator == null &&
    !expandMainToFooter;
  const mainBandScroll = mainOnlyScroll || unifiedMainScroll;
  const hasFollowUpBelowMain = pinnedAfterMain != null || belowEquator != null;
  const mainZoneBottom =
    footerLinkCount > 0 ? footerHeight + footerBottomInset : scaleByWidth(spacing.sm, windowWidth);
  const followUpLayout = hasFollowUpBelowMain
    ? getFollowUpContentLayout(windowHeight, insets, windowWidth, fontScale, mainZoneBottom)
    : null;
  const pinnedMainTop = followUpLayout?.mainTop ?? triggerMainCopyTop;
  const mainClampHeight = followUpLayout?.mainClampHeight;
  const scrollBelowMainTop = followUpLayout?.scrollTop ?? belowEquatorTop;
  const scrollBelowMainBottom = followUpLayout?.scrollBottom ?? mainZoneBottom;

  const pinnedFooter =
    footerLinkCount > 0 ? (
      <View style={styles.footerStack}>
        {footer}
        {showPathsLink ? (
          pathsLinkRevealDelayMs != null ? (
            <FooterRevealLink
              key={pathsLinkRevealKey != null ? `paths-${pathsLinkRevealKey}` : undefined}
              label={uiCopy.pathsLink}
              onPress={() => router.push("/paths")}
              delayMs={pathsLinkRevealDelayMs}
              revealId={flowRevealIds.triggerPaths}
              holdAfterReveal
            />
          ) : (
            <AboutFooterLink label={uiCopy.pathsLink} onPress={() => router.push("/paths")} />
          )
        ) : null}
      </View>
    ) : null;

  return (
    <CalmScreen flush>
      <View style={styles.root}>
        {circles ? (
          <View
            pointerEvents="box-none"
            style={[styles.circlesLayer, { top: metrics.circlesCenterY - circlesLayout.size / 2 }]}
          >
            {circles}
          </View>
        ) : null}

        {useEquatorLayout ? (
          <View pointerEvents="box-none" style={styles.equatorRoot}>
            <View
              pointerEvents="box-none"
              style={[
                styles.mainAnchorSlot,
                expandMainToFooter || mainBandScroll
                  ? { top: triggerMainCopyTop, bottom: mainZoneBottom }
                  : hasFollowUpBelowMain && mainClampHeight != null
                    ? { top: pinnedMainTop, height: mainClampHeight }
                    : { top: triggerMainCopyTop, minHeight: mainCopySlotHeight },
                expandMainToFooter && styles.mainAnchorCentered,
                (expandMainToFooter || pinMainLikeTrigger) && styles.mainAnchorStretch,
              ]}
            >
              {mainBandScroll ? (
                <OverflowScrollView
                  style={styles.mainZoneScroll}
                  contentContainerStyle={styles.mainZoneScrollContentTop}
                  keyboardShouldPersistTaps="handled"
                >
                  <SoftCard flush>{mainLine}</SoftCard>
                  {pinnedAfterMain}
                </OverflowScrollView>
              ) : hasFollowUpBelowMain && mainLine != null && mainClampHeight != null ? (
                <OverflowScrollView
                  style={styles.mainClampScroll}
                  contentContainerStyle={styles.mainClampScrollContent}
                  keyboardShouldPersistTaps="handled"
                >
                  <SoftCard flush>{mainLine}</SoftCard>
                </OverflowScrollView>
              ) : expandMainToFooter ? (
                <View style={styles.equatorMainFill}>{mainLine ?? children}</View>
              ) : (
                <SoftCard flush>{mainLine ?? children}</SoftCard>
              )}
            </View>
            {pinnedAfterMain && !unifiedMainScroll ? (
              pinMainLikeTrigger && mainLine != null ? (
                <OverflowScrollView
                  style={[
                    styles.belowEquatorScroll,
                    { top: scrollBelowMainTop, bottom: scrollBelowMainBottom },
                  ]}
                  contentContainerStyle={[
                    styles.belowEquatorScrollContent,
                    { paddingBottom: scaleByWidth(spacing.md, windowWidth) },
                  ]}
                  keyboardShouldPersistTaps="handled"
                >
                  {pinnedAfterMain}
                </OverflowScrollView>
              ) : (
                <View
                  pointerEvents="box-none"
                  style={[styles.afterMainAnchorSlot, { top: afterMainTop }]}
                >
                  <SoftCard flush>{pinnedAfterMain}</SoftCard>
                </View>
              )
            ) : null}
            {belowEquator ? (
              pinMainLikeTrigger && mainLine != null ? (
                <OverflowScrollView
                  style={[
                    styles.belowEquatorScroll,
                    { top: scrollBelowMainTop, bottom: scrollBelowMainBottom },
                  ]}
                  contentContainerStyle={[
                    styles.belowEquatorScrollContent,
                    { paddingBottom: scaleByWidth(spacing.md, windowWidth) },
                  ]}
                  keyboardShouldPersistTaps="handled"
                >
                  {belowEquator}
                </OverflowScrollView>
              ) : (
                <View
                  pointerEvents="box-none"
                  style={[
                    styles.belowEquator,
                    { top: belowEquatorTop, paddingBottom: scrollBottomPad },
                  ]}
                >
                  {belowEquator}
                </View>
              )
            ) : null}
          </View>
        ) : (
          <OverflowScrollView
            style={styles.scroll}
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingTop: contentZoneTop,
                paddingBottom: scrollBottomPad,
              },
            ]}
            keyboardShouldPersistTaps="handled"
          >
            <SoftCard flush>{children}</SoftCard>
            {belowEquator ? (
              <View pointerEvents="box-none" style={styles.scrollBelowEquator}>
                {belowEquator}
              </View>
            ) : null}
          </OverflowScrollView>
        )}

        {pinnedFooter ? (
          <View pointerEvents="box-none" style={[styles.footer, { paddingBottom: footerBottomInset }]}>
            {pinnedFooter}
          </View>
        ) : null}

        {__DEV__ ? (
          <View style={[styles.devToggleWrap, { top: insets.top + scaleByWidth(8, windowWidth) }]}>
            <View style={styles.devToggleRow}>
              <CalmPressable
                onPress={() => setHighContrastPreviewEnabled(!highContrastPreviewEnabled)}
                style={[styles.devToggle, highContrastPreviewEnabled && styles.devToggleActive]}
                hitSlop={8}
                accessibilityRole="button"
              >
                {(state) => (
                  <CalmText
                    style={[
                      styles.devToggleText,
                      { opacity: resolvePressableTextOpacity(0.95, 1, state) },
                    ]}
                  >
                    {highContrastPreviewEnabled ? "HC ON" : "HC"}
                  </CalmText>
                )}
              </CalmPressable>
              <CalmPressable
                onPress={onDevResetLocalData}
                style={styles.devToggle}
                hitSlop={8}
                accessibilityRole="button"
              >
                {(state) => (
                  <CalmText
                    style={[
                      styles.devToggleText,
                      { opacity: resolvePressableTextOpacity(0.95, 1, state) },
                    ]}
                  >
                    Reset
                  </CalmText>
                )}
              </CalmPressable>
            </View>
          </View>
        ) : null}
      </View>
    </CalmScreen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  circlesLayer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
    elevation: 12,
  },
  equatorRoot: {
    flex: 1,
    zIndex: 1,
  },
  mainAnchorSlot: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: spacing.sm,
    zIndex: 1,
  },
  mainAnchorCentered: {
    justifyContent: "center",
  },
  mainAnchorStretch: {
    alignItems: "stretch",
  },
  afterMainAnchorSlot: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: spacing.md,
  },
  equatorMainFill: {
    flex: 1,
    width: "100%",
    alignSelf: "stretch",
    minWidth: 0,
  },
  mainZoneScroll: {
    flex: 1,
    width: "100%",
    alignSelf: "stretch",
  },
  mainZoneScrollContentTop: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "stretch",
    alignSelf: "stretch",
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    paddingBottom: spacing.sm,
  },
  mainClampScroll: {
    flex: 1,
    width: "100%",
    alignSelf: "stretch",
    minHeight: 0,
  },
  mainClampScrollContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "stretch",
    alignSelf: "stretch",
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
  },
  belowEquator: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: spacing.md,
  },
  belowEquatorScroll: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 1,
  },
  belowEquatorScrollContent: {
    alignItems: "stretch",
    alignSelf: "stretch",
    width: "100%",
    minWidth: 0,
    paddingHorizontal: spacing.sm,
  },
  scroll: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
    paddingBottom: spacing.xl,
    alignItems: "center",
  },
  scrollBelowEquator: {
    alignItems: "center",
    width: "100%",
    alignSelf: "stretch",
    paddingHorizontal: spacing.md,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    zIndex: 110,
    elevation: 14,
  },
  footerStack: {
    alignItems: "center",
    width: "100%",
  },
  devToggleWrap: {
    position: "absolute",
    right: spacing.sm,
    zIndex: 40,
  },
  devToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  devToggle: {
    minHeight: 34,
    minWidth: 52,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
    backgroundColor: "rgba(11,18,30,0.58)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  devToggleActive: {
    borderColor: "rgba(255,255,255,0.75)",
    backgroundColor: "rgba(35,58,84,0.72)",
  },
  devToggleText: {
    fontSize: 11,
    opacity: 0.95,
    letterSpacing: 0.2,
  },
});
