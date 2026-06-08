import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import type { CirclesHintRegistration } from "../types/circles-hint-registration";
import { useAppStore } from "../state/app-store";

export type { CirclesHintRegistration };

/** Register under-circles tap hint while this screen is focused (`PersistentCirclesLayer`). */
export function useRegisterCirclesHint(registration: CirclesHintRegistration | null) {
  const setCirclesHint = useAppStore((s) => s.setCirclesHint);
  const focusedRef = useRef(false);
  const registrationRef = useRef(registration);
  registrationRef.current = registration;

  useFocusEffect(
    useCallback(() => {
      focusedRef.current = true;
      setCirclesHint(registrationRef.current);
      return () => {
        focusedRef.current = false;
        setCirclesHint(null);
      };
    }, [setCirclesHint]),
  );

  useEffect(() => {
    if (focusedRef.current) {
      setCirclesHint(registration);
    }
  }, [registration, setCirclesHint]);
}
