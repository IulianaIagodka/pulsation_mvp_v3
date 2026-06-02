import { useRouter } from "expo-router";
import { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { AnchoredSpiralScreen } from "./AnchoredSpiralScreen";
import { AboutFooterLink } from "./AboutFooterLink";
import { ExplanationText } from "./ExplanationText";
import { GentleTextTransition } from "./GentleTextTransition";
import { CalmText } from "./CalmText";
import { breathingRhythm, spiralHintTiming } from "../animation-rhythm";
import { mainCopyTextStyle } from "../main-copy";
import { spacing } from "../tokens";
import { uiCopy } from "../../modules/delivery-layer";
import { useRegisterSpiralPress } from "../../hooks/use-register-spiral-press";
import { useSpiralHintPresentation } from "../../hooks/use-spiral-hint-presentation";
import { markOnboardingCompleted } from "../../services/onboarding-gate";

export function ShortOnboardingFlow() {
  const router = useRouter();

  const onSpiralPress = useCallback(() => {
    markOnboardingCompleted();
    router.push("/trigger");
  }, [router]);
  useRegisterSpiralPress(onSpiralPress);

  const spiralHint = useSpiralHintPresentation(spiralHintTiming.onboardingAfterMainMs);

  return (
    <AnchoredSpiralScreen footer={<AboutFooterLink label={uiCopy.aboutLink} onPress={() => router.push("/about")} />}>
      <View style={styles.content}>
        <GentleTextTransition style={styles.mainLineWrap} durationMs={breathingRhythm.motion.textFadeInMs}>
          <CalmText style={styles.copy}>{uiCopy.onboardingLine}</CalmText>
        </GentleTextTransition>
        {spiralHint.shouldShow ? (
          <ExplanationText delayMs={spiralHint.delayMs} style={styles.hintWrap} textOpacity={spiralHint.textOpacity}>
            {uiCopy.spiralHint}
          </ExplanationText>
        ) : null}
      </View>
    </AnchoredSpiralScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: "center",
    width: "100%",
    paddingHorizontal: spacing.md,
  },
  mainLineWrap: {
    alignItems: "center",
    width: "100%",
  },
  copy: mainCopyTextStyle,
  hintWrap: {
    marginTop: spacing.lg,
  },
});
