import { useCallback, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { AnchoredSpiralScreen } from "../src/design/components/AnchoredSpiralScreen";
import { ExplanationText } from "../src/design/components/ExplanationText";
import { pickReturnExplanation, uiCopy } from "../src/modules/delivery-layer";
import { useAppStore } from "../src/state/app-store";
import { breathingRhythm, spiralHintTiming } from "../src/design/animation-rhythm";
import { useRegisterSpiralPress } from "../src/hooks/use-register-spiral-press";
import { useSpiralHintPresentation } from "../src/hooks/use-spiral-hint-presentation";

export default function ReturnScreen() {
  const router = useRouter();
  const clear = useAppStore((s) => s.clearIntervention);
  const selected = useAppStore((s) => s.selectedIntervention) ?? "feet_on_ground";
  const [returnExplanation, setReturnExplanation] = useState<string | null>(null);

  const onSpiralPress = useCallback(() => {
    clear();
    router.replace("/trigger");
  }, [clear, router]);
  useRegisterSpiralPress(onSpiralPress);
  const spiralHint = useSpiralHintPresentation(spiralHintTiming.returnAfterFollowUpMs);

  useEffect(() => {
    setReturnExplanation(pickReturnExplanation(selected));
  }, [selected]);

  return (
    <AnchoredSpiralScreen>
      <View style={styles.content}>
        <ExplanationText variant="main" delayMs={breathingRhythm.returnScreen.primaryDelayMs}>
          {uiCopy.returnBody}
        </ExplanationText>
        {returnExplanation ? (
          <ExplanationText
            delayMs={
              breathingRhythm.returnScreen.primaryDelayMs + breathingRhythm.explanationText.secondaryDelayMs
            }
            style={styles.followUp}
          >
            {returnExplanation}
          </ExplanationText>
        ) : null}
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
    alignSelf: "stretch",
    maxWidth: "100%",
  },
  followUp: {
    marginTop: 8,
  },
  hintWrap: {
    marginTop: 12,
  },
});
