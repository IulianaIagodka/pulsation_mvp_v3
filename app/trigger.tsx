import { useEffect } from "react";
import { useRouter } from "expo-router";
import { StyleSheet, TouchableWithoutFeedback, View } from "react-native";
import { CalmScreen } from "../src/design/components/CalmScreen";
import { CalmText } from "../src/design/components/CalmText";
import { SpiralFocus } from "../src/design/components/SpiralFocus";
import { SoftCard } from "../src/design/components/SoftCard";
import { uiCopy } from "../src/modules/delivery-layer";
import { decideIntervention } from "../src/services/pulsation-flow";
import { useAppStore } from "../src/state/app-store";
import { colors } from "../src/design/tokens";
import { spiralLayout } from "../src/design/animation-rhythm";
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
    <CalmScreen centered>
      <SoftCard>
        <View style={styles.spiralSlot}>
          <SpiralFocus onPress={() => router.push("/action")} />
        </View>
        <CalmText style={styles.message}>{uiCopy.triggerPrompt}</CalmText>
        <CalmText style={styles.hint}>{uiCopy.spiralHint}</CalmText>
        <TouchableWithoutFeedback onPress={() => router.push("/about")}>
          <View style={styles.aboutLinkWrap}>
            <CalmText style={styles.aboutLink}>{uiCopy.aboutLink}</CalmText>
          </View>
        </TouchableWithoutFeedback>
      </SoftCard>
    </CalmScreen>
  );
}

const styles = StyleSheet.create({
  spiralSlot: { minHeight: spiralLayout.slotMinHeight, justifyContent: "center", alignItems: "center" },
  message: { color: colors.textPrimary, lineHeight: 29, textAlign: "center", marginTop: 24 },
  hint: {
    marginTop: 14,
    color: colors.textSecondary,
    opacity: 0.38,
    fontSize: 12,
    letterSpacing: 0.4,
    textAlign: "center",
  },
  aboutLinkWrap: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: "center",
  },
  aboutLink: {
    color: colors.textSecondary,
    opacity: 0.7,
    fontSize: 14,
    letterSpacing: 0.35,
    textAlign: "center",
    textDecorationLine: "underline",
  },
});
