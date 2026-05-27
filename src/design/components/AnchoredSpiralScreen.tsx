import { PropsWithChildren, ReactNode } from "react";
import { ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { spiralLayout } from "../animation-rhythm";
import { spacing } from "../tokens";
import { CalmScreen } from "./CalmScreen";
import { SoftCard } from "./SoftCard";

type Props = PropsWithChildren<{
  spiral: ReactNode;
  /** Vertically center text in the area below the spiral (onboarding). */
  centerContent?: boolean;
  /** Pinned to the bottom of the screen (e.g. About link on onboarding). */
  footer?: ReactNode;
}>;

export function AnchoredSpiralScreen({ spiral, children, centerContent = false, footer }: Props) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();

  const contentHeight = windowHeight - insets.top - insets.bottom;
  const spiralTop = insets.top + contentHeight * spiralLayout.anchorRatio - spiralLayout.size / 2;
  const textPaddingTop = spiralTop + spiralLayout.size + spiralLayout.textGap;
  const footerBottomInset = Math.max(insets.bottom, spacing.sm);
  const scrollBottomPad = footer ? 52 + footerBottomInset : spacing.xl;

  return (
    <CalmScreen flush>
      <View style={styles.root}>
        <View pointerEvents="box-none" style={[styles.spiralLayer, { top: spiralTop }]}>
          {spiral}
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: textPaddingTop,
              minHeight: windowHeight - insets.top,
              paddingBottom: scrollBottomPad,
            },
            centerContent && styles.scrollContentCentered,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <SoftCard style={[styles.cardTightTop, centerContent && styles.cardCentered]}>{children}</SoftCard>
        </ScrollView>

        {footer ? (
          <View pointerEvents="box-none" style={[styles.footer, { paddingBottom: footerBottomInset }]}>
            {footer}
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
});
