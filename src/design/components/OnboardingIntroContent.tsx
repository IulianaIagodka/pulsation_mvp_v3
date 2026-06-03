import { Easing, StyleSheet, View } from "react-native";
import { ExplanationText } from "./ExplanationText";
import { GentleTextTransition } from "./GentleTextTransition";
import { CalmText } from "./CalmText";
import { SpiralUnderHint } from "./SpiralUnderHint";
import {
  breathingRhythm,
  getOnboardingExplanationDelayMs,
  getOnboardingSpiralHintDelayMs,
  onboardingRhythm,
} from "../animation-rhythm";
import { mainCopyTextStyle } from "../main-copy";
import { spacing } from "../tokens";
import { uiCopy } from "../../modules/delivery-layer";
import { useSpiralHintPresentation } from "../../hooks/use-spiral-hint-presentation";

const onboardingFadeMs = onboardingRhythm.fadeMs;
const onboardingFadeEasing = Easing.out(Easing.cubic);

export function OnboardingIntroContent() {
  const hintDelayMs = getOnboardingSpiralHintDelayMs(uiCopy.onboardingSteps.length);
  const spiralHint = useSpiralHintPresentation(hintDelayMs);

  return (
    <View style={styles.content}>
      <GentleTextTransition style={styles.mainLineWrap} durationMs={breathingRhythm.motion.textFadeInMs}>
        <CalmText style={styles.copy}>{uiCopy.onboardingLine}</CalmText>
      </GentleTextTransition>

      <ExplanationText
        delayMs={getOnboardingExplanationDelayMs(0)}
        fadeMs={onboardingFadeMs}
        fadeEasing={onboardingFadeEasing}
        style={styles.bodyLine}
      >
        {uiCopy.onboardingSubtitle}
      </ExplanationText>

      {uiCopy.onboardingSteps.map((step, index) => (
        <ExplanationText
          key={step}
          delayMs={getOnboardingExplanationDelayMs(index + 1)}
          fadeMs={onboardingFadeMs}
          fadeEasing={onboardingFadeEasing}
          style={styles.bodyLine}
        >
          {step}
        </ExplanationText>
      ))}

      <SpiralUnderHint
        presentation={spiralHint}
        delayMs={hintDelayMs}
        fadeMs={onboardingFadeMs}
        fadeEasing={onboardingFadeEasing}
        label={uiCopy.onboardingSpiralHint}
        placement="inline"
        style={styles.bodyLine}
      />
    </View>
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
