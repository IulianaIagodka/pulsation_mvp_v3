import { useRouter } from "expo-router";
import { useCallback } from "react";
import { StyleSheet } from "react-native";
import { AnchoredSpiralScreen } from "./AnchoredSpiralScreen";
import { AboutFooterLink } from "./AboutFooterLink";
import { ExplanationText } from "./ExplanationText";
import { SpiralUnderHint } from "./SpiralUnderHint";
import { getOnboardingSpiralHintDelayMs } from "../animation-rhythm";
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
    <AnchoredSpiralScreen
      footer={<AboutFooterLink label={uiCopy.aboutLink} onPress={() => router.push("/about")} />}
      belowEquator={
        <SpiralUnderHint
          presentation={spiralHint}
          delayMs={hintDelayMs}
          label={uiCopy.onboardingSpiralHint}
          placement="inline"
          style={styles.bodyLine}
        />
      }
    >
      <ExplanationText variant="main" holdAfterReveal>{uiCopy.onboardingLine}</ExplanationText>
    </AnchoredSpiralScreen>
  );
}

const styles = StyleSheet.create({
  bodyLine: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    width: "100%",
  },
});
