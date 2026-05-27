import { useRouter } from "expo-router";
import { CalmText } from "../src/design/components/CalmText";
import { AnchoredSpiralScreen } from "../src/design/components/AnchoredSpiralScreen";
import { SpiralFocus } from "../src/design/components/SpiralFocus";
import { uiCopy } from "../src/modules/delivery-layer";
import { useAppStore } from "../src/state/app-store";
import { StyleSheet, View } from "react-native";
import { colors } from "../src/design/tokens";

export default function ReturnScreen() {
  const router = useRouter();
  const clear = useAppStore((s) => s.clearIntervention);

  return (
    <AnchoredSpiralScreen
      spiral={
        <SpiralFocus
          onPress={() => {
            clear();
            router.replace("/");
          }}
        />
      }
    >
      <View style={styles.content}>
        <CalmText style={styles.body}>{uiCopy.returnBody}</CalmText>
      </View>
    </AnchoredSpiralScreen>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: "center" },
  body: { color: colors.textSecondary, textAlign: "center", fontSize: 16, lineHeight: 25 },
});
