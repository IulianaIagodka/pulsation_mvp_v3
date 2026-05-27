import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { CalmText } from "../src/design/components/CalmText";
import { AnchoredSpiralScreen } from "../src/design/components/AnchoredSpiralScreen";
import { AboutFooterLink } from "../src/design/components/AboutFooterLink";
import { ExplanationText } from "../src/design/components/ExplanationText";
import { SpiralFocus } from "../src/design/components/SpiralFocus";
import { spacing } from "../src/design/tokens";
import { mainCopyTextStyle } from "../src/design/main-copy";
import { uiCopy } from "../src/modules/delivery-layer";
import { GentleTextTransition } from "../src/design/components/GentleTextTransition";
import { breathingRhythm, spiralHintTiming } from "../src/design/animation-rhythm";

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <AnchoredSpiralScreen
      spiral={<SpiralFocus onPress={() => router.push("/trigger")} />}
      footer={<AboutFooterLink label={uiCopy.aboutLink} onPress={() => router.push("/about")} />}
    >
      <View style={styles.content}>
        <GentleTextTransition
          style={styles.mainLineWrap}
          durationMs={breathingRhythm.motion.textFadeInMs}
        >
          <CalmText style={styles.copy}>{uiCopy.onboardingLine}</CalmText>
        </GentleTextTransition>
        <ExplanationText delayMs={spiralHintTiming.onboardingAfterMainMs} style={styles.hintWrap}>
          {uiCopy.spiralHint}
        </ExplanationText>
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
