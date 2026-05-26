import { useRouter } from "expo-router";
import { Animated, Platform, StyleSheet, TouchableWithoutFeedback, View } from "react-native";
import { CalmScreen } from "../src/design/components/CalmScreen";
import { CalmText } from "../src/design/components/CalmText";
import { SpiralFocus } from "../src/design/components/SpiralFocus";
import { colors, spacing } from "../src/design/tokens";
import { useEffect, useRef } from "react";
import { uiCopy } from "../src/modules/delivery-layer";
import { spiralLayout } from "../src/design/animation-rhythm";

export default function OnboardingScreen() {
  const router = useRouter();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();
  }, [opacity]);

  return (
    <CalmScreen centered>
      <Animated.View style={[styles.content, { opacity }]}>
        <View style={styles.spiralSlot}>
          <SpiralFocus onPress={() => router.push("/trigger")} />
        </View>
        <View style={styles.textWrap}>
          <CalmText style={styles.copy}>{uiCopy.onboardingLine}</CalmText>
        </View>
        <CalmText style={styles.hint}>{uiCopy.spiralHint}</CalmText>
        <TouchableWithoutFeedback onPress={() => router.push("/about")}>
          <View style={styles.aboutLinkWrap}>
            <CalmText style={styles.aboutLink}>{uiCopy.aboutLink}</CalmText>
          </View>
        </TouchableWithoutFeedback>
      </Animated.View>
    </CalmScreen>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: "center" },
  spiralSlot: { minHeight: spiralLayout.slotMinHeight, justifyContent: "center", alignItems: "center" },
  textWrap: { marginTop: spacing.xl, maxWidth: 286 },
  copy: {
    color: colors.textSecondary,
    fontSize: 17,
    lineHeight: 30,
    fontWeight: "400",
    textAlign: "center",
    letterSpacing: 0.2,
    fontFamily: Platform.select({ ios: "Times New Roman", default: "serif" }),
  },
  hint: {
    marginTop: spacing.lg,
    color: colors.textSecondary,
    opacity: 0.38,
    fontSize: 12,
    letterSpacing: 0.4,
    textAlign: "center",
  },
  aboutLinkWrap: {
    marginTop: spacing.xl,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignSelf: "center",
  },
  aboutLink: {
    color: colors.textSecondary,
    opacity: 0.7,
    fontSize: 14,
    letterSpacing: 0.35,
    textAlign: "center",
    textDecorationLine: "underline",
  },
});
