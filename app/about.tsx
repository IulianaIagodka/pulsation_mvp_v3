import { useRouter } from "expo-router";
import Constants from "expo-constants";
import { useMemo } from "react";
import { PixelRatio, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { AboutFooterLink } from "../src/design/components/AboutFooterLink";
import { CalmScreen } from "../src/design/components/CalmScreen";
import { CalmText } from "../src/design/components/CalmText";
import { legibleOpacity, MAX_FONT_SIZE_MULTIPLIER } from "../src/design/accessibility";
import { getContentMaxWidth } from "../src/design/responsive";
import { useHighContrast } from "../src/hooks/use-high-contrast";
import { uiCopy } from "../src/modules/delivery-layer";
import { colors, spacing, typography } from "../src/design/tokens";

export default function AboutScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const highContrast = useHighContrast();
  const fontScale = Math.min(PixelRatio.getFontScale(), MAX_FONT_SIZE_MULTIPLIER);
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
        <ScrollView
          contentContainerStyle={scrollContentStyle}
          showsVerticalScrollIndicator={false}
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
        </ScrollView>
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
  scroll: {
    paddingTop: spacing.md,
    flexGrow: 1,
    width: "100%",
    alignSelf: "center",
  },
  title: {
    fontSize: typography.gentle,
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
    fontSize: 16,
    lineHeight: 26,
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
    fontSize: 13,
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
