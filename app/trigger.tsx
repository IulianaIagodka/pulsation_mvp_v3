import { useCallback, useEffect } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { AnchoredSpiralScreen } from "../src/design/components/AnchoredSpiralScreen";
import { ExplanationText } from "../src/design/components/ExplanationText";
import { uiCopy } from "../src/modules/delivery-layer";
import { useRegisterSpiralPress } from "../src/hooks/use-register-spiral-press";
import { decideIntervention } from "../src/services/pulsation-flow";
import { useAppStore } from "../src/state/app-store";
import { playTriggerHaptic } from "../src/services/haptic-regulation";
import { InterventionType } from "../src/types/domain";
import { breathingRhythm, spiralHintTiming } from "../src/design/animation-rhythm";

const defaultIntervention: InterventionType = "find_three_things";

export default function TriggerScreen() {
  const router = useRouter();
  const setSelected = useAppStore((s) => s.setSelectedIntervention);

  useEffect(() => {
    const selected = decideIntervention() ?? defaultIntervention;
    setSelected(selected);
  }, [setSelected]);

  const onSpiralPress = useCallback(() => router.push("/action"), [router]);
  useRegisterSpiralPress(onSpiralPress);

  useFocusEffect(
    useCallback(() => {
      playTriggerHaptic();
    }, []),
  );

  return (
    <AnchoredSpiralScreen>
      <View style={styles.content}>
        <ExplanationText variant="main" delayMs={breathingRhythm.explanationText.primaryDelayMs}>
          {uiCopy.triggerPrompt}
        </ExplanationText>
        <ExplanationText delayMs={spiralHintTiming.triggerAfterPromptMs} style={styles.hintWrap}>
          {uiCopy.spiralHint}
        </ExplanationText>
      </View>
    </AnchoredSpiralScreen>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: "center", width: "100%" },
  hintWrap: {
    marginTop: 14,
  },
});
