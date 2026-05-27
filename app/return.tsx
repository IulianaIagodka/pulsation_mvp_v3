import { useEffect } from "react";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { AnchoredSpiralScreen } from "../src/design/components/AnchoredSpiralScreen";
import { ExplanationText } from "../src/design/components/ExplanationText";
import { SpiralFocus } from "../src/design/components/SpiralFocus";
import { interventionGuidance, uiCopy } from "../src/modules/delivery-layer";
import { useAppStore } from "../src/state/app-store";
import { breathingRhythm, spiralHintTiming } from "../src/design/animation-rhythm";
import { playReturnHaptic } from "../src/services/haptic-regulation";

export default function ReturnScreen() {
  const router = useRouter();
  const clear = useAppStore((s) => s.clearIntervention);
  const selected = useAppStore((s) => s.selectedIntervention) ?? "feet_on_ground";

  useEffect(() => {
    playReturnHaptic();
  }, []);

  return (
    <AnchoredSpiralScreen
      spiral={
        <SpiralFocus
          startDelayMs={800}
          onPress={() => {
            clear();
            router.replace("/");
          }}
        />
      }
    >
      <View style={styles.content}>
        <ExplanationText variant="main" delayMs={breathingRhythm.explanationText.primaryDelayMs}>
          {uiCopy.returnBody}
        </ExplanationText>
        <ExplanationText delayMs={breathingRhythm.explanationText.secondaryDelayMs} style={styles.followUp}>
          {interventionGuidance[selected].explanationText}
        </ExplanationText>
        <ExplanationText delayMs={spiralHintTiming.returnAfterFollowUpMs} style={styles.hintWrap}>
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
