import { Redirect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { CalmText } from "../src/design/components/CalmText";
import { AnchoredSpiralScreen } from "../src/design/components/AnchoredSpiralScreen";
import { AboutFooterLink } from "../src/design/components/AboutFooterLink";
import { ExplanationText } from "../src/design/components/ExplanationText";
import { spacing } from "../src/design/tokens";
import { mainCopyTextStyle } from "../src/design/main-copy";
import { uiCopy } from "../src/modules/delivery-layer";
import { GentleTextTransition } from "../src/design/components/GentleTextTransition";
import { breathingRhythm, spiralHintTiming } from "../src/design/animation-rhythm";
import { useRegisterSpiralPress } from "../src/hooks/use-register-spiral-press";
import { useSpiralHintPresentation } from "../src/hooks/use-spiral-hint-presentation";
import {
  hasCompletedOnboarding,
  markOnboardingCompleted,
} from "../src/services/onboarding-gate";

export default function OnboardingScreen() {
  const router = useRouter();
  const [gateChecked, setGateChecked] = useState(false);
  const [skipOnboarding, setSkipOnboarding] = useState(false);

  useEffect(() => {
    setSkipOnboarding(hasCompletedOnboarding());
    setGateChecked(true);
  }, []);

  const onSpiralPress = useCallback(() => {
    markOnboardingCompleted();
    router.push("/trigger");
  }, [router]);
  useRegisterSpiralPress(onSpiralPress);
  const spiralHint = useSpiralHintPresentation(spiralHintTiming.onboardingAfterMainMs);

  if (!gateChecked) {
    return null;
  }

  if (skipOnboarding) {
    return <Redirect href="/trigger" />;
  }

  return (
    <AnchoredSpiralScreen footer={<AboutFooterLink label={uiCopy.aboutLink} onPress={() => router.push("/about")} />}>
      <View style={styles.content}>
        <GentleTextTransition
          style={styles.mainLineWrap}
          durationMs={breathingRhythm.motion.textFadeInMs}
        >
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
