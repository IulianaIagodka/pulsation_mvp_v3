import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { AboutFooterLink } from "../src/design/components/AboutFooterLink";
import { OverflowScrollView } from "../src/design/components/OverflowScrollView";
import { CalmPressable } from "../src/design/components/CalmPressable";
import { resolvePressableTextOpacity } from "../src/design/pressable-highlight";
import { CalmScreen } from "../src/design/components/CalmScreen";
import { CalmText } from "../src/design/components/CalmText";
import { getCappedFontScale, legibleOpacity } from "../src/design/accessibility";
import { useHighContrast } from "../src/hooks/use-high-contrast";
import { interventionCopy, uiCopy } from "../src/modules/delivery-layer";
import { removeKeptIntervention } from "../src/services/adaptive-preferences";
import { getPathsSnapshot } from "../src/services/paths-stats";
import type { InterventionType } from "../src/types/domain";
import { explanationTextStyle } from "../src/design/main-copy";
import { getContentMaxWidth } from "../src/design/responsive";
import { colors, spacing, typography } from "../src/design/tokens";

type RemoveIconProps = {
  color: string;
  size?: number;
};

function RemoveIcon({ color, size = 20 }: RemoveIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7h12Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M10 11v5M14 11v5" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

export default function PathsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const highContrast = useHighContrast();
  const fontScale = getCappedFontScale();
  const [kept, setKept] = useState<InterventionType[]>([]);
  const [actionsToday, setActionsToday] = useState(0);

  useFocusEffect(
    useCallback(() => {
      try {
        const snapshot = getPathsSnapshot();
        setKept(snapshot.keptInterventions);
        setActionsToday(snapshot.actionsToday);
      } catch (error) {
        console.warn("[paths] Failed to load snapshot:", error);
        setKept([]);
        setActionsToday(0);
      }
    }, []),
  );

  const footerRowHeight = Math.min(Math.max(44 * fontScale, 44), 132);
  const pageInnerStyle = useMemo(
    () => [styles.pageInner, { maxWidth: getContentMaxWidth(width), paddingBottom: footerRowHeight }],
    [footerRowHeight, width],
  );

  const countOpacity = legibleOpacity(0.72, highContrast, "muted");
  const labelOpacity = legibleOpacity(0.52, highContrast, "faint");
  const faintOpacity = legibleOpacity(0.48, highContrast, "faint");
  const bodyOpacity = legibleOpacity(0.58, highContrast, "muted");
  const removeIconColor = colors.textSecondary;
  const removeIconOpacity = legibleOpacity(0.42, highContrast, "faint");
  const removeIconOpacityActive = legibleOpacity(0.62, highContrast, "muted");

  const onRemoveKept = useCallback((id: InterventionType) => {
    removeKeptIntervention(id);
    setKept((prev) => prev.filter((item) => item !== id));
  }, []);

  return (
    <CalmScreen>
      <View style={styles.root}>
        <View style={pageInnerStyle}>
          <View style={styles.todaySection}>
            {actionsToday > 0 ? (
              <>
                <CalmText
                  style={[
                    styles.todayCount,
                    { opacity: countOpacity },
                    highContrast && styles.todayCountHighContrast,
                  ]}
                >
                  {actionsToday}
                </CalmText>
                <CalmText
                  style={[
                    styles.pathsMetaLabel,
                    styles.todayLabel,
                    { opacity: labelOpacity },
                    highContrast && styles.bodyHighContrast,
                  ]}
                >
                  {uiCopy.pathsTodayCountLabel(actionsToday)}
                </CalmText>
              </>
            ) : (
              <CalmText
                style={[styles.todayEmpty, { opacity: faintOpacity }, highContrast && styles.bodyHighContrast]}
              >
                {uiCopy.pathsTodayNone}
              </CalmText>
            )}
          </View>

          <OverflowScrollView
            style={styles.savedScroll}
            contentContainerStyle={styles.savedScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <CalmText
              style={[
                styles.pathsMetaLabel,
                styles.savedSectionLabel,
                { opacity: labelOpacity },
                highContrast && styles.bodyHighContrast,
              ]}
            >
              {uiCopy.pathsSavedLabel}
            </CalmText>
            {kept.length === 0 ? (
              <CalmText
                style={[styles.sectionBody, { opacity: faintOpacity }, highContrast && styles.bodyHighContrast]}
              >
                {uiCopy.pathsSavedEmpty}
              </CalmText>
            ) : (
              kept.map((id) => {
                const label = interventionCopy[id as keyof typeof interventionCopy] ?? id;
                return (
                  <View key={id} style={styles.savedRow}>
                    <CalmText
                      style={[
                        styles.sectionBody,
                        styles.savedItemLabel,
                        { opacity: bodyOpacity },
                        highContrast && styles.bodyHighContrast,
                      ]}
                    >
                      {label}
                    </CalmText>
                    <CalmPressable
                      onPress={() => onRemoveKept(id)}
                      hitSlop={10}
                      accessibilityRole="button"
                      accessibilityLabel={uiCopy.pathsRemoveSavedA11y(label)}
                      style={styles.removeButton}
                    >
                      {(state) => (
                        <View style={styles.removeIconWrap}>
                          <View
                            style={{
                              opacity: resolvePressableTextOpacity(
                                removeIconOpacity,
                                removeIconOpacityActive,
                                state,
                              ),
                            }}
                          >
                            <RemoveIcon color={removeIconColor} />
                          </View>
                        </View>
                      )}
                    </CalmPressable>
                  </View>
                );
              })
            )}
          </OverflowScrollView>
        </View>
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
  pageInner: {
    flex: 1,
    flexBasis: 0,
    minHeight: 0,
    paddingTop: spacing.md,
    width: "100%",
    alignSelf: "center",
  },
  todaySection: {
    alignItems: "center",
    width: "100%",
    marginBottom: spacing.lg,
  },
  todayCount: {
    color: colors.textSecondary,
    fontSize: 48,
    lineHeight: 54,
    textAlign: "center",
  },
  todayCountHighContrast: {
    color: colors.textPrimary,
    opacity: 0.82,
  },
  pathsMetaLabel: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22,
    textAlign: "center",
    width: "100%",
  },
  todayLabel: {
    marginTop: spacing.xs,
  },
  todayEmpty: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22,
    textAlign: "center",
    width: "100%",
  },
  savedScroll: {
    flex: 1,
    flexBasis: 0,
    minHeight: 0,
    marginTop: spacing.lg,
    width: "100%",
    alignSelf: "stretch",
  },
  savedScrollContent: {
    flexGrow: 0,
    width: "100%",
    alignSelf: "stretch",
    paddingBottom: spacing.md,
  },
  savedSectionLabel: {
    marginTop: 0,
    marginBottom: spacing.sm,
  },
  sectionBody: {
    ...explanationTextStyle,
    textAlign: "left",
    color: colors.textSecondary,
  },
  bodyHighContrast: {
    color: colors.textPrimary,
    opacity: 0.78,
  },
  savedRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    minWidth: 0,
    marginTop: spacing.sm,
  },
  savedItemLabel: {
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
    width: undefined,
    maxWidth: undefined,
    paddingRight: spacing.sm,
  },
  removeButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  removeIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
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
