import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { CalmActionButton } from "../src/design/components/CalmActionButton";
import { CalmScreen } from "../src/design/components/CalmScreen";
import { CalmText } from "../src/design/components/CalmText";
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
  const [kept, setKept] = useState<InterventionType[]>([]);
  const [actionsToday, setActionsToday] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const snapshot = getPathsSnapshot();
      setKept(snapshot.keptInterventions);
      setActionsToday(snapshot.actionsToday);
    }, []),
  );

  return (
    <CalmScreen>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <CalmText style={styles.title}>{uiCopy.pathsTitle}</CalmText>

        <View style={styles.section}>
          <CalmText style={styles.sectionLabel}>{uiCopy.pathsTodayLabel}</CalmText>
          <CalmText style={styles.sectionBody}>{formatTodayLine(actionsToday)}</CalmText>
        </View>

        <View style={styles.section}>
          <CalmText style={styles.sectionLabel}>{uiCopy.pathsKeptLabel}</CalmText>
          {kept.length === 0 ? (
            <CalmText style={styles.sectionBody}>{uiCopy.pathsKeptEmpty}</CalmText>
          ) : (
            kept.map((id) => (
              <CalmText key={id} style={styles.listItem}>
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
  section: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    color: colors.textSecondary,
    opacity: 0.72,
    fontSize: 13,
    letterSpacing: 0.35,
    marginBottom: spacing.xs,
    textTransform: "uppercase",
  },
  sectionBody: {
    textAlign: "left",
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 26,
  },
  listItem: {
    textAlign: "left",
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 28,
    marginTop: spacing.xs,
  },
  footer: {
    marginTop: spacing.xl,
    alignItems: "flex-start",
  },
});
