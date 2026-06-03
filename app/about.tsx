import { useRouter } from "expo-router";
import Constants from "expo-constants";
import { ScrollView, StyleSheet, View } from "react-native";
import { AboutFooterLink } from "../src/design/components/AboutFooterLink";
import { CalmActionButton } from "../src/design/components/CalmActionButton";
import { CalmScreen } from "../src/design/components/CalmScreen";
import { CalmText } from "../src/design/components/CalmText";
import { uiCopy } from "../src/modules/delivery-layer";
import { colors, spacing, typography } from "../src/design/tokens";

export default function AboutScreen() {
  const router = useRouter();
  const version = Constants.expoConfig?.version ?? "1.0.0";

  return (
    <CalmScreen>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <CalmText style={styles.title}>{uiCopy.aboutTitle}</CalmText>
        {uiCopy.aboutParagraphs.map((paragraph, index) => (
          <CalmText key={index} style={styles.paragraph}>
            {paragraph}
          </CalmText>
        ))}
        <CalmText style={styles.version}>
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
    paddingBottom: spacing.xl,
    maxWidth: 420,
    width: "100%",
    alignSelf: "center",
  },
  title: {
    fontSize: typography.gentle,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    textAlign: "left",
  },
  paragraph: {
    textAlign: "left",
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 26,
    marginBottom: spacing.md,
  },
  version: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    opacity: 0.55,
    fontSize: 13,
    textAlign: "left",
  },
  footer: {
    marginTop: spacing.xl,
    alignItems: "center",
    width: "100%",
  },
});
