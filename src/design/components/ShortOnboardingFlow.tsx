import { useRouter } from "expo-router";
import { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { AnchoredSpiralScreen } from "./AnchoredSpiralScreen";
import { AboutFooterLink } from "./AboutFooterLink";
import { SpiralUnderHint } from "./SpiralUnderHint";
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

  const underSpiralHint = <SpiralUnderHint presentation={spiralHint} />;

  return (
    <AnchoredSpiralScreen
      spiralHint={underSpiralHint}
      footer={<AboutFooterLink label={uiCopy.aboutLink} onPress={() => router.push("/about")} />}
    >
      <View style={styles.content}>
        <GentleTextTransition style={styles.mainLineWrap} durationMs={breathingRhythm.motion.textFadeInMs}>
          <CalmText style={styles.copy}>{uiCopy.onboardingLine}</CalmText>
        </GentleTextTransition>
      </View>
    </AnchoredSpiralScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: "center",
    width: "100%",
    alignSelf: "stretch",
    paddingHorizontal: spacing.md,
  },
  mainLineWrap: {
    alignItems: "center",
    width: "100%",
    alignSelf: "stretch",
  },
  copy: mainCopyTextStyle,
});
