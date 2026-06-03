import { useRouter } from "expo-router";
import { useCallback } from "react";
import { Easing, StyleSheet, View } from "react-native";
import { AnchoredSpiralScreen } from "./AnchoredSpiralScreen";
import { AboutFooterLink } from "./AboutFooterLink";
import { SpiralUnderHint } from "./SpiralUnderHint";
import { GentleTextTransition } from "./GentleTextTransition";
import { CalmText } from "./CalmText";
import { breathingRhythm, getOnboardingSpiralHintDelayMs, onboardingRhythm } from "../animation-rhythm";
import { mainCopyTextStyle } from "../main-copy";
import { spacing } from "../tokens";
import { uiCopy } from "../../modules/delivery-layer";
import { useRegisterSpiralPress } from "../../hooks/use-register-spiral-press";
import { useSpiralHintPresentation } from "../../hooks/use-spiral-hint-presentation";
import { markExtendedOnboardingCompleted } from "../../services/onboarding-gate";

export function ShortOnboardingFlow() {
  const router = useRouter();

  const onSpiralPress = useCallback(() => {
    markExtendedOnboardingCompleted();
    router.replace("/trigger");
  }, [router]);
  useRegisterSpiralPress(onSpiralPress);

  const hintDelayMs = getOnboardingSpiralHintDelayMs(0);
  const spiralHint = useSpiralHintPresentation(hintDelayMs);

  return (
    <AnchoredSpiralScreen footer={<AboutFooterLink label={uiCopy.aboutLink} onPress={() => router.push("/about")} />}>
      <View style={styles.content}>
        <GentleTextTransition style={styles.mainLineWrap} durationMs={breathingRhythm.motion.textFadeInMs}>
          <CalmText style={styles.copy}>{uiCopy.onboardingLine}</CalmText>
        </GentleTextTransition>
        <SpiralUnderHint
          presentation={spiralHint}
          delayMs={hintDelayMs}
          fadeMs={onboardingRhythm.fadeMs}
          fadeEasing={Easing.out(Easing.cubic)}
          label={uiCopy.onboardingSpiralHint}
          placement="inline"
          style={styles.bodyLine}
        />
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
  bodyLine: {
    marginTop: spacing.md,
  },
});
