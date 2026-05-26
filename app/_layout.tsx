import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { bootstrapPulsation } from "../src/services/pulsation-flow";
import { useEffect } from "react";
import { AppState } from "react-native";
import { recordAppStateChange } from "../src/modules/session-runtime";

export default function Layout() {
  useEffect(() => {
    bootstrapPulsation();
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active" || nextState === "background" || nextState === "inactive") {
        recordAppStateChange(nextState);
      }
    });
    return () => subscription.remove();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#0D121E" },
          animation: "fade",
        }}
      />
    </>
  );
}
