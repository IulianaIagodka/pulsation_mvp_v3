import { useCallback, useRef } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { AnchoredSpiralScreen } from "../src/design/components/AnchoredSpiralScreen";
import { ExplanationText } from "../src/design/components/ExplanationText";
import { SpiralUnderHint } from "../src/design/components/SpiralUnderHint";
import { uiCopy } from "../src/modules/delivery-layer";
import { useRegisterSpiralPress } from "../src/hooks/use-register-spiral-press";
import { decideIntervention, registerPulsationDismissed } from "../src/services/pulsation-flow";
import { useAppStore } from "../src/state/app-store";
import { playTriggerHaptic } from "../src/services/haptic-regulation";
import { breathingRhythm, spiralHintTiming } from "../src/design/animation-rhythm";
import { useSpiralHintPresentation } from "../src/hooks/use-spiral-hint-presentation";

export default function TriggerScreen() {
  const router = useRouter();
  const setSelected = useAppStore((s) => s.setSelectedIntervention);
  const wentToActionRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      wentToActionRef.current = false;
      setSelected(decideIntervention());

      return () => {
        if (!wentToActionRef.current) {
          registerPulsationDismissed();
        }
      };
    }, [setSelected]),
  );

  const onSpiralPress = useCallback(() => {
    wentToActionRef.current = true;
    router.push("/action");
  }, [router]);
  useRegisterSpiralPress(onSpiralPress);
  const spiralHint = useSpiralHintPresentation(spiralHintTiming.triggerAfterPromptMs);

  useFocusEffect(
    useCallback(() => {
      playTriggerHaptic();
    }, []),
  );

  return (
    <AnchoredSpiralScreen spiralHint={<SpiralUnderHint presentation={spiralHint} />}>
      <View style={styles.content}>
        <ExplanationText variant="main" delayMs={breathingRhythm.explanationText.primaryDelayMs}>
          {uiCopy.triggerPrompt}
        </ExplanationText>
      </View>
    </AnchoredSpiralScreen>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: "center", width: "100%" },
});
