import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { bootstrapPulsation } from "../src/services/pulsation-flow";
import { useEffect } from "react";
import { InactivityTriggerListener } from "../src/components/InactivityTriggerListener";
import { NotificationOpenListener } from "../src/components/NotificationOpenListener";
import { configureInactivityNotifications } from "../src/services/inactivity-notification";
import { breathingRhythm } from "../src/design/animation-rhythm";

export default function Layout() {
  useEffect(() => {
    bootstrapPulsation();
    configureInactivityNotifications();
  }, []);

  return (
    <>
      <InactivityTriggerListener />
      <NotificationOpenListener />
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#0D121E" },
          animation: "fade",
          animationDuration: breathingRhythm.motion.screenFadeMs,
        }}
      />
    </>
  );
}
