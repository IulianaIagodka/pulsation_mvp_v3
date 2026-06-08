import { SourceSerif4_400Regular, useFonts } from "@expo-google-fonts/source-serif-4";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { bootstrapPulsation } from "../src/services/pulsation-flow";
import { useEffect } from "react";
import { InactivityTriggerListener } from "../src/components/InactivityTriggerListener";
import { NotificationOpenListener } from "../src/components/NotificationOpenListener";
import { configureInactivityNotifications } from "../src/services/inactivity-notification";
import { breathingRhythm } from "../src/design/animation-rhythm";
import { ensureCirclesBreathEngineStarted } from "../src/design/circles-breath-engine";
import { PersistentCirclesLayer } from "../src/design/components/PersistentCirclesLayer";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";

export default function Layout() {
  const [fontsLoaded] = useFonts({ SourceSerif4_400Regular });

  useEffect(() => {
    bootstrapPulsation();
    configureInactivityNotifications();
    ensureCirclesBreathEngineStarted();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <InactivityTriggerListener />
      <NotificationOpenListener />
      <StatusBar style="light" />
      <View style={styles.root}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#0D121E" },
            animation: "fade",
            animationDuration: breathingRhythm.motion.screenFadeMs,
          }}
        >
          <Stack.Screen name="trigger" options={{ animation: "none" }} />
          <Stack.Screen name="action" options={{ animation: "none" }} />
          <Stack.Screen name="return" options={{ animation: "none" }} />
        </Stack>
        <PersistentCirclesLayer />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
