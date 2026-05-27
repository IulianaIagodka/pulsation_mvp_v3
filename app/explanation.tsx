import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { CalmText } from "../src/design/components/CalmText";
import { AnchoredSpiralScreen } from "../src/design/components/AnchoredSpiralScreen";
import { SpiralFocus } from "../src/design/components/SpiralFocus";
import { interventionGuidance, uiCopy } from "../src/modules/delivery-layer";
import { useAppStore } from "../src/state/app-store";
import { colors } from "../src/design/tokens";

export default function ExplanationScreen() {
  const router = useRouter();
  const selected = useAppStore((s) => s.selectedIntervention) ?? "feet_on_ground";

  return (
    <AnchoredSpiralScreen spiral={<SpiralFocus onPress={() => router.push("/return")} />}>
      <View style={styles.content}>
        <CalmText style={styles.body}>{interventionGuidance[selected].explanationText}</CalmText>
        <CalmText style={styles.hint}>{uiCopy.spiralHint}</CalmText>
      </View>
    </AnchoredSpiralScreen>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: "center" },
  body: { color: colors.textSecondary, textAlign: "center", fontSize: 16, lineHeight: 25 },
  hint: {
    marginTop: 14,
    color: colors.textSecondary,
    opacity: 0.38,
    fontSize: 12,
    letterSpacing: 0.4,
    textAlign: "center",
  },
});
