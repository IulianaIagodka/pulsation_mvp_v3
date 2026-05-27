import { useRouter } from "expo-router";
import { Animated, Platform, StyleSheet, TouchableWithoutFeedback, View } from "react-native";
import { CalmText } from "../src/design/components/CalmText";
import { AnchoredSpiralScreen } from "../src/design/components/AnchoredSpiralScreen";
import { SpiralFocus } from "../src/design/components/SpiralFocus";
import { colors, spacing } from "../src/design/tokens";
import { useEffect, useRef } from "react";
import { uiCopy } from "../src/modules/delivery-layer";

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
    <AnchoredSpiralScreen
      spiral={<SpiralFocus onPress={() => router.push("/trigger")} />}
      footer={
        <TouchableWithoutFeedback onPress={() => router.push("/about")}>
          <View style={styles.aboutLinkWrap}>
            <CalmText style={styles.aboutLink}>{uiCopy.aboutLink}</CalmText>
          </View>
        </TouchableWithoutFeedback>
      }
    >
      <Animated.View style={[styles.content, { opacity }]}>
        <CalmText
          style={styles.copy}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.82}
        >
          {uiCopy.onboardingLine}
        </CalmText>
        <CalmText style={styles.hint}>{uiCopy.spiralHint}</CalmText>
      </Animated.View>
    </AnchoredSpiralScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: "center",
    width: "100%",
    paddingHorizontal: spacing.md,
  },
  copy: {
    color: colors.textSecondary,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "400",
    textAlign: "center",
    letterSpacing: 0.15,
    width: "100%",
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
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
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
