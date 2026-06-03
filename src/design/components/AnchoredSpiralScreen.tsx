import { PropsWithChildren, ReactNode } from "react";
import { useRouter } from "expo-router";
import { PixelRatio, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { MAX_FONT_SIZE_MULTIPLIER } from "../accessibility";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { spiralLayout } from "../animation-rhythm";
import { spacing } from "../tokens";
import { clamp, scaleByWidth } from "../responsive";
import { useAppStore } from "../../state/app-store";
import { uiCopy } from "../../modules/delivery-layer";
import { AboutFooterLink } from "./AboutFooterLink";
import { CalmText } from "./CalmText";
import { CalmScreen } from "./CalmScreen";
import { SoftCard } from "./SoftCard";

type Props = PropsWithChildren<{
  /** Omit when spiral is rendered by `PersistentSpiralLayer` in the root layout. */
  spiral?: ReactNode;
  /** Vertically center text in the area below the spiral (onboarding). */
  centerContent?: boolean;
  /** Pinned to the bottom of the screen (e.g. About link on onboarding). */
  footer?: ReactNode;
  /** Quiet label directly under the spiral (e.g. “tap the spiral”). */
  spiralHint?: ReactNode;
  /** Show “Show my paths” in the footer (trigger + return only). */
  showPathsLink?: boolean;
}>;

export function AnchoredSpiralScreen({
  spiral,
  children,
  centerContent = false,
  footer,
  spiralHint,
  showPathsLink = false,
}: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const fontScale = Math.min(PixelRatio.getFontScale(), MAX_FONT_SIZE_MULTIPLIER);
  const highContrastPreviewEnabled = useAppStore((s) => s.highContrastPreviewEnabled);
  const setHighContrastPreviewEnabled = useAppStore((s) => s.setHighContrastPreviewEnabled);

  const contentHeight = windowHeight - insets.top - insets.bottom;
  const spiralTop = insets.top + contentHeight * spiralLayout.anchorRatio - spiralLayout.size / 2;
  const spiralHintLineHeight = spiralHint
    ? clamp(Math.round(scaleByWidth(16, windowWidth) * fontScale), 14, 56)
    : 0;
  const hintPullUp = spiralHint ? scaleByWidth(spiralLayout.hintOverlap, windowWidth) : 0;
  const hintToContent = scaleByWidth(spiralLayout.hintToContentGap, windowWidth);
  const textPaddingTop = spiralHint
    ? spiralTop + spiralLayout.size + hintPullUp + spiralHintLineHeight + hintToContent
    : spiralTop + spiralLayout.size + spiralLayout.textGap;
  const footerBottomInset = Math.max(insets.bottom, scaleByWidth(spacing.sm, windowWidth));
  const footerLinkCount = (showPathsLink ? 1 : 0) + (footer ? 1 : 0);
  const footerRowHeight = clamp(scaleByWidth(44, windowWidth) * fontScale, 44, 132);
  const footerHeight = footerLinkCount > 0 ? footerRowHeight * footerLinkCount + scaleByWidth(spacing.xs, windowWidth) : 0;
  const scrollBottomPad =
    footerLinkCount > 0 ? footerHeight + footerBottomInset : scaleByWidth(spacing.xl, windowWidth);

  const pinnedFooter =
    footerLinkCount > 0 ? (
      <View style={styles.footerStack}>
        {footer}
        {showPathsLink ? (
          <AboutFooterLink label={uiCopy.pathsLink} onPress={() => router.push("/paths")} />
        ) : null}
      </View>
    ) : null;

  return (
    <CalmScreen flush>
      <View style={styles.root}>
        {spiral ? (
          <View pointerEvents="box-none" style={[styles.spiralLayer, { top: spiralTop }]}>
            {spiral}
          </View>
        ) : null}

        {spiralHint ? (
          <View
            pointerEvents="none"
            style={[
              styles.spiralHintLayer,
              {
                top:
                  spiralTop +
                  spiralLayout.size +
                  scaleByWidth(spiralLayout.hintOverlap, windowWidth),
                height: spiralHintLineHeight,
              },
            ]}
          >
            {spiralHint}
          </View>
        ) : null}

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: textPaddingTop,
              paddingBottom: scrollBottomPad,
            },
            !centerContent && { minHeight: windowHeight - insets.top - footerHeight },
            centerContent && styles.scrollContentCentered,
            centerContent && { minHeight: windowHeight - insets.top },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          alwaysBounceVertical={false}
        >
          <SoftCard
            style={[
              spiralHint ? styles.cardBelowHint : styles.cardTightTop,
              centerContent && styles.cardCentered,
            ]}
          >
            {children}
          </SoftCard>
        </ScrollView>

        {pinnedFooter ? (
          <View pointerEvents="box-none" style={[styles.footer, { paddingBottom: footerBottomInset }]}>
            {pinnedFooter}
          </View>
        ) : null}

        {__DEV__ ? (
          <View style={[styles.devToggleWrap, { top: insets.top + scaleByWidth(8, windowWidth) }]}>
            <Pressable
              onPress={() => setHighContrastPreviewEnabled(!highContrastPreviewEnabled)}
              style={[styles.devToggle, highContrastPreviewEnabled && styles.devToggleActive]}
              hitSlop={8}
              accessibilityRole="button"
            >
              <CalmText style={styles.devToggleText}>
                {highContrastPreviewEnabled ? "HC ON" : "HC"}
              </CalmText>
            </Pressable>
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
  spiralHintLayer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "flex-start",
    zIndex: 9,
    elevation: 8,
    paddingHorizontal: spacing.md,
  },
  scroll: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
    alignItems: "center",
  },
  scrollContentCentered: {
    justifyContent: "center",
  },
  cardTightTop: {
    paddingTop: spacing.xs,
  },
  cardBelowHint: {
    paddingTop: 0,
  },
  cardCentered: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
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
