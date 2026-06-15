import { useCallback, useEffect, useRef } from "react";
import { AppState } from "react-native";
import { usePathname, useRouter } from "expo-router";
import {
  consumeResumeSessionOnForeground,
  recordAppStateChange,
} from "../modules/session-runtime";
import { goToTrigger } from "../navigation/go-to-trigger";
import { isPathBlockedForAutoTrigger, shouldAutoOpenTrigger } from "../modules/inactivity-trigger";
import { shouldLeaveLaunchOnboardingOnResume } from "../services/launch-routing";
import { recordAppOpen } from "../data/repositories/scheduling-profile-repo";
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

  const tryResumeTrigger = useCallback(() => {
    void cancelInactivityNotification();

    const resumeSession = consumeResumeSessionOnForeground();

    if (shouldLeaveLaunchOnboardingOnResume(pathnameRef.current, resumeSession)) {
      goToTrigger(router, pathnameRef.current);
      return;
    }

    if (resumeSession.kind !== "warm" || resumeSession.inactiveMinutes <= 0) return;

    recordAppOpen(Date.now());
    if (isPathBlockedForAutoTrigger(pathnameRef.current, resumeSession.inactiveMinutes)) return;
    if (!shouldAutoOpenTrigger(resumeSession.inactiveMinutes)) return;

    goToTrigger(router, pathnameRef.current);
  }, [router]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      recordAppStateChange(nextState);

      if (nextState === "background" || nextState === "inactive") {
        void scheduleInactivityNotification();
        return;
      }

      if (nextState !== "active") return;

      tryResumeTrigger();
    });

    if (AppState.currentState === "active") {
      tryResumeTrigger();
    }

    return () => subscription.remove();
  }, [tryResumeTrigger]);

  return null;
}
