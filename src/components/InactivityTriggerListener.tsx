import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { usePathname, useRouter } from "expo-router";
import {
  consumeInactiveMinutesOnResume,
  recordAppStateChange,
} from "../modules/session-runtime";
import { isPathBlockedForAutoTrigger, shouldAutoOpenTrigger } from "../modules/inactivity-trigger";
import {
  cancelInactivityNotification,
  scheduleInactivityNotification,
} from "../services/inactivity-notification";

export function InactivityTriggerListener() {
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      recordAppStateChange(nextState);

      if (nextState === "background" || nextState === "inactive") {
        void scheduleInactivityNotification();
        return;
      }

      if (nextState !== "active") return;

      void cancelInactivityNotification();

      if (isPathBlockedForAutoTrigger(pathnameRef.current)) return;

      const inactiveMinutes = consumeInactiveMinutesOnResume();
      if (!shouldAutoOpenTrigger(inactiveMinutes)) return;

      router.replace("/trigger");
    });

    return () => subscription.remove();
  }, [router]);

  return null;
}
