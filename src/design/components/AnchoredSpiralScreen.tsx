import { PropsWithChildren, ReactNode, useLayoutEffect } from "react";
import type { SpiralUnderHintSlot } from "../../types/spiral-under-hint";
import { useRouter } from "expo-router";
import { PixelRatio, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { MAX_FONT_SIZE_MULTIPLIER } from "../accessibility";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { spiralLayout } from "../animation-rhythm";
import { spacing } from "../tokens";
import { CalmPressable } from "./CalmPressable";
import { resolvePressableTextOpacity } from "../pressable-highlight";
import { clamp, scaleByWidth } from "../responsive";
import {
  getContentZoneTopWithoutHint,
  getContentZoneTopWithHint,
  getScreenEquatorY,
  getSpiralAnchorMetrics,
} from "../spiral-anchor-layout";
import { useAppStore } from "../../state/app-store";
import { uiCopy } from "../../modules/delivery-layer";
import { AboutFooterLink } from "./AboutFooterLink";
import { FooterRevealLink } from "./FooterRevealLink";
import { CalmText } from "./CalmText";
import { CalmScreen } from "./CalmScreen";
import { SoftCard } from "./SoftCard";

type Props = PropsWithChildren<{
  /** Omit when spiral is rendered by `PersistentSpiralLayer` in the root layout. */
  spiral?: ReactNode;
  /** Place main copy on the vertical screen equator (default). Set false for scroll-only layouts. */
  centerContent?: boolean;
  /** Optional copy below the equator main line (e.g. return follow-up). */
  belowEquator?: ReactNode;
  /** Pinned to the bottom of the screen (e.g. About link on onboarding). */
  footer?: ReactNode;
  /** Under-spiral hint data — rendered in `PersistentSpiralLayer` above the spiral motion. */
  spiralHint?: SpiralUnderHintSlot;
  /** Show “Show my paths” in the footer (trigger / “one action” screen only). */
  showPathsLink?: boolean;
  /** Fade in paths link with main copy (trigger). */
  pathsLinkRevealDelayMs?: number;
  pathsLinkRevealKey?: number;
}>;

export function AnchoredSpiralScreen({
  spiral,
  children,
  centerContent = true,
  belowEquator,
  footer,
  spiralHint,
  showPathsLink = false,
  pathsLinkRevealDelayMs,
  pathsLinkRevealKey,
}: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const fontScale = Math.min(PixelRatio.getFontScale(), MAX_FONT_SIZE_MULTIPLIER);
  const highContrastPreviewEnabled = useAppStore((s) => s.highContrastPreviewEnabled);
  const setHighContrastPreviewEnabled = useAppStore((s) => s.setHighContrastPreviewEnabled);
  const setSpiralUnderHint = useAppStore((s) => s.setSpiralUnderHint);

  const metrics = getSpiralAnchorMetrics(windowHeight, insets);
  const footerBottomInset = Math.max(insets.bottom, scaleByWidth(spacing.sm, windowWidth));
  const footerLinkCount = (showPathsLink ? 1 : 0) + (footer ? 1 : 0);
  const footerRowHeight = clamp(scaleByWidth(44, windowWidth) * fontScale, 44, 132);
  const footerHeight = footerLinkCount > 0 ? footerRowHeight * footerLinkCount + scaleByWidth(spacing.xs, windowWidth) : 0;
  const scrollBottomPad =
    footerLinkCount > 0 ? footerHeight + footerBottomInset : scaleByWidth(spacing.xl, windowWidth);
  const hintSlotVisible =
    Boolean(spiralHint) &&
    (spiralHint?.visible ?? true) &&
    Boolean(spiralHint?.presentation.shouldShow);
  const contentZoneTop = hintSlotVisible
    ? getContentZoneTopWithHint(metrics, windowWidth, fontScale)
    : getContentZoneTopWithoutHint(metrics, windowWidth);
  const screenEquatorY = getScreenEquatorY(windowHeight, insets);
  const belowEquatorTop = screenEquatorY + scaleByWidth(36, windowWidth) * fontScale;
  /** Equator pin ignores under-spiral hint — flow screens must scroll from `contentZoneTop`. */
  const useEquatorLayout = centerContent && !spiralHint;

  useLayoutEffect(() => {
    setSpiralUnderHint(spiralHint ?? null);
    return () => setSpiralUnderHint(null);
  }, [spiralHint, setSpiralUnderHint]);

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
              revealKey={pathsLinkRevealKey}
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
        {spiral ? (
          <View
            pointerEvents="box-none"
            style={[styles.spiralLayer, { top: metrics.spiralCenterY - spiralLayout.size / 2 }]}
          >
            {spiral}
          </View>
        ) : null}

        {useEquatorLayout ? (
          <View pointerEvents="box-none" style={styles.equatorRoot}>
            <View
              pointerEvents="box-none"
              style={[styles.equatorPin, { height: screenEquatorY * 2 }]}
            >
              <SoftCard style={styles.equatorCard}>{children}</SoftCard>
            </View>
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
            <SoftCard style={spiralHint ? styles.cardBelowHint : styles.cardTightTop}>
              {children}
            </SoftCard>
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
  spiralLayer: {
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
  equatorPin: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
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
  cardTightTop: {
    paddingTop: spacing.xs,
  },
  cardBelowHint: {
    paddingTop: 0,
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
    zIndex: 5,
    elevation: 4,
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
