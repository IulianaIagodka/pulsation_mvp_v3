import { useRouter } from "expo-router";
import Constants from "expo-constants";
import { useMemo } from "react";
import { PixelRatio, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AboutFooterLink } from "../src/design/components/AboutFooterLink";
import { CalmActionButton } from "../src/design/components/CalmActionButton";
import { CalmScreen } from "../src/design/components/CalmScreen";
import { CalmText } from "../src/design/components/CalmText";
import { legibleOpacity, MAX_FONT_SIZE_MULTIPLIER } from "../src/design/accessibility";
import { useHighContrast } from "../src/hooks/use-high-contrast";
import { uiCopy } from "../src/modules/delivery-layer";
import { colors, spacing, typography } from "../src/design/tokens";

export default function AboutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const highContrast = useHighContrast();
  const fontScale = Math.min(PixelRatio.getFontScale(), MAX_FONT_SIZE_MULTIPLIER);
  const version = Constants.expoConfig?.version ?? "1.0.0";
  const versionOpacity = legibleOpacity(0.55, highContrast, "faint");

  const scrollContentStyle = useMemo(
    () => [
      styles.scroll,
      {
        paddingBottom: spacing.xl + insets.bottom + spacing.lg * fontScale,
      },
    ],
    [fontScale, insets.bottom],
  );

  return (
    <CalmScreen>
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
        <View style={styles.footer}>
          <AboutFooterLink label={uiCopy.pathsLink} onPress={() => router.push("/paths")} />
          <CalmActionButton label={uiCopy.aboutBack} onPress={() => router.back()} />
        </View>
      </ScrollView>
    </CalmScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingTop: spacing.md,
    flexGrow: 1,
    maxWidth: 420,
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
  footer: {
    marginTop: spacing.xl,
    alignItems: "center",
    width: "100%",
  },
});
