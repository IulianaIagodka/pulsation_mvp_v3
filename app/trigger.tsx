import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { CalmScreen } from "../src/design/components/CalmScreen";
import { CalmText } from "../src/design/components/CalmText";
import { SpiralFocus } from "../src/design/components/SpiralFocus";
import { SoftCard } from "../src/design/components/SoftCard";
import { uiCopy } from "../src/modules/delivery-layer";
import { decideIntervention } from "../src/services/pulsation-flow";
import { useAppStore } from "../src/state/app-store";
import { colors } from "../src/design/tokens";
import { spiralLayout } from "../src/design/animation-rhythm";

export default function TriggerScreen() {
  const router = useRouter();
  const setSelected = useAppStore((s) => s.setSelectedIntervention);
  const [message, setMessage] = useState(uiCopy.triggerPrompt);
  const [canProceedToAction, setCanProceedToAction] = useState(true);

  useEffect(() => {
    const selected = decideIntervention();
    if (selected) {
      setSelected(selected);
      setCanProceedToAction(true);
    } else {
      // MVP flow always offers one action immediately after onboarding.
      setSelected("find_three_things");
      setMessage(uiCopy.triggerPrompt);
      setCanProceedToAction(true);
    }
  }, [setSelected]);

  return (
    <CalmScreen centered>
      <SoftCard>
        <View style={styles.spiralSlot}>
          <SpiralFocus onPress={() => router.push(canProceedToAction ? "/action" : "/return")} />
        </View>
        <CalmText style={styles.message}>{message}</CalmText>
        <CalmText style={styles.hint}>{uiCopy.spiralHint}</CalmText>
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
});
