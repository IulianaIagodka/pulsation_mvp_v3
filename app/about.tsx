import { useRouter } from "expo-router";
import Constants from "expo-constants";
import { useMemo } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { AboutFooterLink } from "../src/design/components/AboutFooterLink";
import { OverflowScrollView } from "../src/design/components/OverflowScrollView";
import { CalmScreen } from "../src/design/components/CalmScreen";
import { CalmText } from "../src/design/components/CalmText";
import { getCappedFontScale, legibleOpacity } from "../src/design/accessibility";
import { getContentMaxWidth } from "../src/design/responsive";
import { useHighContrast } from "../src/hooks/use-high-contrast";
import { uiCopy } from "../src/modules/delivery-layer";
import { colors, spacing } from "../src/design/tokens";

export default function AboutScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const highContrast = useHighContrast();
  const fontScale = getCappedFontScale();
  const version = Constants.expoConfig?.version ?? "1.0.0";
  const versionOpacity = legibleOpacity(0.55, highContrast, "faint");
  const footerRowHeight = Math.min(Math.max(44 * fontScale, 44), 132);

  const scrollContentStyle = useMemo(
    () => [
      styles.scroll,
      {
        maxWidth: getContentMaxWidth(width),
        paddingBottom: spacing.xl + footerRowHeight,
      },
    ],
    [footerRowHeight, width],
  );

  return (
    <CalmScreen>
      <View style={styles.root}>
        <OverflowScrollView
          style={styles.scrollView}
          contentContainerStyle={scrollContentStyle}
          keyboardShouldPersistTaps="handled"
        >
          <CalmText style={[styles.title, highContrast && styles.titleHighContrast]}>{uiCopy.aboutTitle}</CalmText>
          {uiCopy.aboutParagraphs.map((paragraph, index) => (
            <CalmText key={index} style={[styles.paragraph, highContrast && styles.paragraphHighContrast]}>
              {paragraph}
            </CalmText>
          ))}
          <CalmText style={[styles.version, { opacity: versionOpacity }, highContrast && styles.paragraphHighContrast]}>
            {uiCopy.aboutVersionPrefix} {version}
          </CalmText>
        </OverflowScrollView>
        <View style={styles.pinnedFooter}>
          <AboutFooterLink label={uiCopy.aboutBack} onPress={() => router.back()} />
        </View>
      </View>
    </CalmScreen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scroll: {
    paddingTop: spacing.md,
    width: "100%",
    alignSelf: "center",
  },
  title: {
    fontSize: 20,
    lineHeight: 24,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    textAlign: "left",
    width: "100%",
  },
  titleHighContrast: {
    opacity: 0.98,
  },
  paragraph: {
    textAlign: "left",
    color: colors.textSecondary,
    fontSize: 17,
    lineHeight: 24,
    marginBottom: spacing.md,
    width: "100%",
  },
  paragraphHighContrast: {
    color: colors.textPrimary,
    opacity: 0.95,
  },
  version: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    textAlign: "left",
    width: "100%",
  },
  pinnedFooter: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    width: "100%",
  },
});
