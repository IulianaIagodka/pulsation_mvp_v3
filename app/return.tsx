import { useRouter } from "expo-router";
import { CalmScreen } from "../src/design/components/CalmScreen";
import { CalmText } from "../src/design/components/CalmText";
import { SpiralFocus } from "../src/design/components/SpiralFocus";
import { SoftCard } from "../src/design/components/SoftCard";
import { uiCopy } from "../src/modules/delivery-layer";
import { useAppStore } from "../src/state/app-store";
import { StyleSheet, View } from "react-native";
import { colors } from "../src/design/tokens";
import { spiralLayout } from "../src/design/animation-rhythm";

export default function ReturnScreen() {
  const router = useRouter();
  const clear = useAppStore((s) => s.clearIntervention);

  return (
    <CalmScreen centered>
      <SoftCard>
        <View style={styles.spiralSlot}>
          <SpiralFocus
            onPress={() => {
              clear();
              router.replace("/");
            }}
          />
        </View>
        <CalmText style={styles.body}>{uiCopy.returnBody}</CalmText>
      </SoftCard>
    </CalmScreen>
  );
}

const styles = StyleSheet.create({
  spiralSlot: { minHeight: spiralLayout.slotMinHeight, justifyContent: "center", alignItems: "center" },
  body: { color: colors.textSecondary, textAlign: "center", fontSize: 16, lineHeight: 25, marginTop: 24 },
});
