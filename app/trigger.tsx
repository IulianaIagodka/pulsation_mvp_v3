import { useCallback, useEffect } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { AnchoredSpiralScreen } from "../src/design/components/AnchoredSpiralScreen";
import { ExplanationText } from "../src/design/components/ExplanationText";
import { uiCopy } from "../src/modules/delivery-layer";
import { useRegisterSpiralPress } from "../src/hooks/use-register-spiral-press";
import { decideIntervention } from "../src/services/pulsation-flow";
import { useAppStore } from "../src/state/app-store";
import { playTriggerHaptic } from "../src/services/haptic-regulation";
import { InterventionType } from "../src/types/domain";
import { breathingRhythm, spiralHintTiming } from "../src/design/animation-rhythm";
import { useSpiralHintPresentation } from "../src/hooks/use-spiral-hint-presentation";
import { scaleByWidth } from "../src/design/responsive";

const defaultIntervention: InterventionType = "find_three_things";

export default function TriggerScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const setSelected = useAppStore((s) => s.setSelectedIntervention);

  useEffect(() => {
    const selected = decideIntervention() ?? defaultIntervention;
    setSelected(selected);
  }, [setSelected]);

  const onSpiralPress = useCallback(() => router.push("/action"), [router]);
  useRegisterSpiralPress(onSpiralPress);
  const spiralHint = useSpiralHintPresentation(spiralHintTiming.triggerAfterPromptMs);

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
        {spiralHint.shouldShow ? (
          <ExplanationText
            delayMs={spiralHint.delayMs}
            style={[styles.hintWrap, { marginTop: scaleByWidth(14, width) }]}
            textOpacity={spiralHint.textOpacity}
          >
            {uiCopy.spiralHint}
          </ExplanationText>
        ) : null}
      </View>
    </AnchoredSpiralScreen>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: "center", width: "100%" },
  hintWrap: {},
});
