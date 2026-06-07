import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import type { CirclesHintRegistration } from "../types/circles-hint-registration";
import { useAppStore } from "../state/app-store";

export type { CirclesHintRegistration };

/** Register under-circles tap hint while this screen is focused (`PersistentCirclesLayer`). */
export function useRegisterCirclesHint(registration: CirclesHintRegistration | null) {
  const setCirclesHint = useAppStore((s) => s.setCirclesHint);

  useFocusEffect(
    useCallback(() => {
      setCirclesHint(registration);
      return () => setCirclesHint(null);
    }, [registration, setCirclesHint]),
  );
}
