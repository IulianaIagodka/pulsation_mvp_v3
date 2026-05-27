import { useEffect } from "react";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { CalmText } from "../src/design/components/CalmText";
import { AnchoredSpiralScreen } from "../src/design/components/AnchoredSpiralScreen";
import { SpiralFocus } from "../src/design/components/SpiralFocus";
import { uiCopy } from "../src/modules/delivery-layer";
import { decideIntervention } from "../src/services/pulsation-flow";
import { useAppStore } from "../src/state/app-store";
import { colors } from "../src/design/tokens";
import { InterventionType } from "../src/types/domain";

const defaultIntervention: InterventionType = "find_three_things";

export default function TriggerScreen() {
  const router = useRouter();
  const setSelected = useAppStore((s) => s.setSelectedIntervention);

  useEffect(() => {
    const selected = decideIntervention() ?? defaultIntervention;
    setSelected(selected);
  }, [setSelected]);

  return (
    <AnchoredSpiralScreen spiral={<SpiralFocus onPress={() => router.push("/action")} />}>
      <View style={styles.content}>
        <CalmText style={styles.message}>{uiCopy.triggerPrompt}</CalmText>
        <CalmText style={styles.hint}>{uiCopy.spiralHint}</CalmText>
      </View>
    </AnchoredSpiralScreen>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: "center" },
  message: { color: colors.textPrimary, lineHeight: 29, textAlign: "center" },
  hint: {
    marginTop: 14,
    color: colors.textSecondary,
    opacity: 0.38,
    fontSize: 12,
    letterSpacing: 0.4,
    textAlign: "center",
  },
});
