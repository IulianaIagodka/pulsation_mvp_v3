import { PropsWithChildren, ReactNode } from "react";
import { useRouter } from "expo-router";
import { PixelRatio, ScrollView, StyleSheet, View } from "react-native";
import { MAX_FONT_SIZE_MULTIPLIER } from "../accessibility";
import { useStableLayoutInsets } from "../../hooks/use-stable-layout-insets";
import { useStableWindowDimensions } from "../../hooks/use-stable-window-dimensions";
import { circlesLayout } from "../animation-rhythm";
import { spacing } from "../tokens";
import { CalmPressable } from "./CalmPressable";
import { resolvePressableTextOpacity } from "../pressable-highlight";
import { clamp, scaleByWidth } from "../responsive";
import {
  getContentZoneTopWithoutHint,
  getMainCopySlotHeight,
  getReturnFollowUpTop,
  getScreenEquatorY,
  getCirclesAnchorMetrics,
  getTriggerMainCopyTop,
} from "../circles-anchor-layout";
import { useAppStore } from "../../state/app-store";
import { uiCopy } from "../../modules/delivery-layer";
import { AboutFooterLink } from "./AboutFooterLink";
import { FooterRevealLink } from "./FooterRevealLink";
import { CalmText } from "./CalmText";
import { CalmScreen } from "./CalmScreen";
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
  /** Fade in paths link with main copy (trigger). */
  pathsLinkRevealDelayMs?: number;
  /** Tighter scroll top for App Store capture (full extended onboarding on one screen). */
  compactCapture?: boolean;
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
  compactCapture = false,
  pinMainLikeTrigger = false,
}: Props) {
  const router = useRouter();
  const insets = useStableLayoutInsets();
  const { height: windowHeight, width: windowWidth } = useStableWindowDimensions();
  const fontScale = Math.min(PixelRatio.getFontScale(), MAX_FONT_SIZE_MULTIPLIER);
  const highContrastPreviewEnabled = useAppStore((s) => s.highContrastPreviewEnabled);
  const setHighContrastPreviewEnabled = useAppStore((s) => s.setHighContrastPreviewEnabled);

  const metrics = getCirclesAnchorMetrics(windowHeight, insets);
  const footerBottomInset = Math.max(insets.bottom, scaleByWidth(spacing.sm, windowWidth));
  const footerLinkCount = (showPathsLink ? 1 : 0) + (footer ? 1 : 0);
  const footerRowHeight = clamp(scaleByWidth(44, windowWidth) * fontScale, 44, 132);
  const footerHeight = footerLinkCount > 0 ? footerRowHeight * footerLinkCount + scaleByWidth(spacing.xs, windowWidth) : 0;
  const scrollBottomPad =
    footerLinkCount > 0 ? footerHeight + footerBottomInset : scaleByWidth(spacing.xl, windowWidth);
  const contentZoneTop = compactCapture
    ? metrics.circlesBottomY + scaleByWidth(spacing.xs, windowWidth)
    : getContentZoneTopWithoutHint(metrics, windowWidth);
  const triggerMainCopyTop = getTriggerMainCopyTop(metrics, windowWidth);
  const mainCopySlotHeight = getMainCopySlotHeight(windowWidth, fontScale);
  const screenEquatorY = getScreenEquatorY(windowHeight, insets);
  const belowEquatorTop = pinMainLikeTrigger
    ? getReturnFollowUpTop(metrics, windowWidth, fontScale)
    : screenEquatorY + scaleByWidth(36, windowWidth) * fontScale;
  const useEquatorLayout = centerContent && pinMainLikeTrigger;
  const afterMainTop = triggerMainCopyTop + mainCopySlotHeight;
  const pinnedAfterMain = mainLine != null ? children : null;

  const pinnedFooter =
    footerLinkCount > 0 ? (
      <View style={styles.footerStack}>
        {footer}
        {showPathsLink ? (
          pathsLinkRevealDelayMs != null ? (
            <FooterRevealLink
              label={uiCopy.pathsLink}
              onPress={() => router.push("/paths")}
              delayMs={pathsLinkRevealDelayMs}
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
                { top: triggerMainCopyTop, minHeight: mainCopySlotHeight },
              ]}
            >
              <SoftCard style={styles.equatorCard}>{mainLine ?? children}</SoftCard>
            </View>
            {pinnedAfterMain ? (
              <View
                pointerEvents="box-none"
                style={[styles.afterMainAnchorSlot, { top: afterMainTop }]}
              >
                <SoftCard style={styles.equatorCard}>{pinnedAfterMain}</SoftCard>
              </View>
            ) : null}
            {belowEquator ? (
              <View
                pointerEvents="box-none"
                style={[
                  styles.belowEquator,
                  { top: belowEquatorTop, paddingBottom: scrollBottomPad },
                ]}
              >
                {belowEquator}
              </View>
            ) : null}
          </View>
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingTop: contentZoneTop,
                paddingBottom: scrollBottomPad,
              },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            alwaysBounceVertical={false}
          >
            <SoftCard style={styles.equatorCard}>{children}</SoftCard>
            {belowEquator ? (
              <View pointerEvents="box-none" style={styles.scrollBelowEquator}>
                {belowEquator}
              </View>
            ) : null}
          </ScrollView>
        )}

        {pinnedFooter ? (
          <View pointerEvents="box-none" style={[styles.footer, { paddingBottom: footerBottomInset }]}>
            {pinnedFooter}
          </View>
        ) : null}

        {__DEV__ ? (
          <View style={[styles.devToggleWrap, { top: insets.top + scaleByWidth(8, windowWidth) }]}>
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
  },
  mainAnchorSlot: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: spacing.md,
  },
  afterMainAnchorSlot: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: spacing.md,
  },
  equatorCard: {
    paddingTop: 0,
    paddingBottom: 0,
  },
  belowEquator: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: spacing.md,
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
    fontSize: 12,
    opacity: 0.95,
    letterSpacing: 0.2,
  },
});
