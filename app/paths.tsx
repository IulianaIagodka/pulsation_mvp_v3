import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { PixelRatio, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CalmActionButton } from "../src/design/components/CalmActionButton";
import { CalmScreen } from "../src/design/components/CalmScreen";
import { CalmText } from "../src/design/components/CalmText";
import { legibleOpacity, MAX_FONT_SIZE_MULTIPLIER } from "../src/design/accessibility";
import { useHighContrast } from "../src/hooks/use-high-contrast";
import { interventionCopy, uiCopy } from "../src/modules/delivery-layer";
import { getPathsSnapshot } from "../src/services/paths-stats";
import type { InterventionType } from "../src/types/domain";
import { colors, spacing, typography } from "../src/design/tokens";

function formatTodayLine(count: number): string {
  if (count <= 0) return uiCopy.pathsTodayNone;
  return uiCopy.pathsTodayCount(count);
}

export default function PathsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const highContrast = useHighContrast();
  const fontScale = Math.min(PixelRatio.getFontScale(), MAX_FONT_SIZE_MULTIPLIER);
  const [kept, setKept] = useState<InterventionType[]>([]);
  const [actionsToday, setActionsToday] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const snapshot = getPathsSnapshot();
      setKept(snapshot.keptInterventions);
      setActionsToday(snapshot.actionsToday);
    }, []),
  );

  const scrollContentStyle = useMemo(
    () => [
      styles.scroll,
      {
        paddingBottom: spacing.xl + insets.bottom + spacing.lg * fontScale,
      },
    ],
    [fontScale, insets.bottom],
  );

  const labelOpacity = legibleOpacity(0.72, highContrast, "muted");
  const faintOpacity = legibleOpacity(0.55, highContrast, "faint");

  return (
    <CalmScreen>
      <ScrollView
        contentContainerStyle={scrollContentStyle}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <CalmText style={[styles.title, highContrast && styles.titleHighContrast]}>{uiCopy.pathsTitle}</CalmText>

        <View style={styles.section}>
          <CalmText style={[styles.sectionLabel, { opacity: labelOpacity }]}>{uiCopy.pathsTodayLabel}</CalmText>
          <CalmText style={[styles.sectionBody, highContrast && styles.bodyHighContrast]}>
            {formatTodayLine(actionsToday)}
          </CalmText>
        </View>

        <View style={styles.section}>
          <CalmText style={[styles.sectionLabel, { opacity: labelOpacity }]}>{uiCopy.pathsKeptLabel}</CalmText>
          {kept.length === 0 ? (
            <CalmText style={[styles.sectionBody, { opacity: faintOpacity }, highContrast && styles.bodyHighContrast]}>
              {uiCopy.pathsKeptEmpty}
            </CalmText>
          ) : (
            kept.map((id) => (
              <CalmText key={id} style={[styles.listItem, highContrast && styles.bodyHighContrast]}>
                {interventionCopy[id]}
              </CalmText>
            ))
          )}
        </View>

        <View style={styles.footer}>
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
  section: {
    marginBottom: spacing.lg,
    width: "100%",
  },
  sectionLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    letterSpacing: 0.35,
    marginBottom: spacing.xs,
    textTransform: "uppercase",
    textAlign: "left",
    width: "100%",
  },
  sectionBody: {
    textAlign: "left",
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 26,
    width: "100%",
  },
  bodyHighContrast: {
    color: colors.textPrimary,
    opacity: 0.95,
  },
  listItem: {
    textAlign: "left",
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 28,
    marginTop: spacing.xs,
    width: "100%",
  },
  footer: {
    marginTop: spacing.xl,
    alignItems: "flex-start",
    width: "100%",
  },
});
