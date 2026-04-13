import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { CalmScreen } from "../src/design/components/CalmScreen";
import { CalmText } from "../src/design/components/CalmText";
import { SpiralFocus } from "../src/design/components/SpiralFocus";
import { SoftCard } from "../src/design/components/SoftCard";
import { interventionGuidance, uiCopy } from "../src/modules/delivery-layer";
import { useAppStore } from "../src/state/app-store";
import { colors } from "../src/design/tokens";
import { spiralLayout } from "../src/design/animation-rhythm";

export default function ExplanationScreen() {
  const router = useRouter();
  const selected = useAppStore((s) => s.selectedIntervention) ?? "feet_on_ground";

  return (
    <CalmScreen centered>
      <SoftCard>
        <View style={styles.spiralSlot}>
          <SpiralFocus onPress={() => router.push("/return")} />
        </View>
        <CalmText style={styles.body}>{interventionGuidance[selected].explanationText}</CalmText>
        <CalmText style={styles.hint}>{uiCopy.spiralHint}</CalmText>
      </SoftCard>
    </CalmScreen>
  );
}

const styles = StyleSheet.create({
  spiralSlot: { minHeight: spiralLayout.slotMinHeight, justifyContent: "center", alignItems: "center" },
  body: { color: colors.textSecondary, textAlign: "center", fontSize: 16, lineHeight: 25, marginTop: 24 },
  hint: {
    marginTop: 14,
    color: colors.textSecondary,
    opacity: 0.38,
    fontSize: 12,
    letterSpacing: 0.4,
    textAlign: "center",
  },
});
