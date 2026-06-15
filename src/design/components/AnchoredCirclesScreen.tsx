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
import { scaleByWidth } from "../responsive";
import { getAnchoredCirclesScreenLayout } from "../anchored-circles-screen-layout";
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

  const footerLinkCount = (showPathsLink ? 1 : 0) + (footer ? 1 : 0);
  const pinnedAfterMain = mainLine != null ? children : null;
  const layout = getAnchoredCirclesScreenLayout({
    windowHeight,
    windowWidth,
    insets,
    fontScale,
    footerLinkCount,
    centerContent,
    compactCapture,
    pinMainLikeTrigger,
    expandMainToFooter,
    hasMainLine: mainLine != null,
    hasPinnedAfterMain: pinnedAfterMain != null,
    hasBelowEquator: belowEquator != null,
  });

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
            style={[
              styles.circlesLayer,
              { top: layout.metrics.circlesCenterY - circlesLayout.size / 2 },
            ]}
          >
            {circles}
          </View>
        ) : null}

        {layout.useEquatorLayout ? (
          <View pointerEvents="box-none" style={styles.equatorRoot}>
            <View
              pointerEvents="box-none"
              style={[
                styles.mainAnchorSlot,
                expandMainToFooter || layout.mainBandScroll
                  ? { top: layout.triggerMainCopyTop, bottom: layout.mainZoneBottom }
                  : layout.hasFollowUpBelowMain && layout.mainClampHeight != null
                    ? { top: layout.pinnedMainTop, height: layout.mainClampHeight }
                    : { top: layout.triggerMainCopyTop, minHeight: layout.mainCopySlotHeight },
                expandMainToFooter && styles.mainAnchorCentered,
                (expandMainToFooter || pinMainLikeTrigger) && styles.mainAnchorStretch,
              ]}
            >
              {layout.mainBandScroll ? (
                <OverflowScrollView
                  style={styles.mainZoneScroll}
                  contentContainerStyle={styles.mainZoneScrollContentTop}
                  keyboardShouldPersistTaps="handled"
                >
                  <SoftCard flush>{mainLine}</SoftCard>
                  {pinnedAfterMain}
                </OverflowScrollView>
              ) : layout.hasFollowUpBelowMain && mainLine != null && layout.mainClampHeight != null ? (
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
            {pinnedAfterMain && !layout.unifiedMainScroll ? (
              pinMainLikeTrigger && mainLine != null ? (
                <OverflowScrollView
                  style={[
                    styles.belowEquatorScroll,
                    { top: layout.scrollBelowMainTop, bottom: layout.scrollBelowMainBottom },
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
                  style={[styles.afterMainAnchorSlot, { top: layout.afterMainTop }]}
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
                    { top: layout.scrollBelowMainTop, bottom: layout.scrollBelowMainBottom },
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
                    { top: layout.belowEquatorTop, paddingBottom: layout.scrollBottomPad },
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
                paddingTop: layout.contentZoneTop,
                paddingBottom: layout.scrollBottomPad,
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
          <View pointerEvents="box-none" style={[styles.footer, { paddingBottom: layout.footerBottomInset }]}>
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
