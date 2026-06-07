import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { useAppStore } from "../state/app-store";
import { playCirclesTapHaptic } from "../services/haptic-regulation";
import { recordCirclesTap } from "../services/circles-hint";

/** Register circles tap handler while this screen is focused (persistent overlay). */
export function useRegisterCirclesPress(handler: (() => void) | null) {
  const setCirclesPressHandler = useAppStore((s) => s.setCirclesPressHandler);
  const wrappedHandler = useCallback(() => {
    if (!handler) return;
    playCirclesTapHaptic();
    recordCirclesTap("flow");
    handler();
  }, [handler]);

  useFocusEffect(
    useCallback(() => {
      setCirclesPressHandler(handler ? wrappedHandler : null);
      return () => setCirclesPressHandler(null);
    }, [handler, setCirclesPressHandler, wrappedHandler]),
  );
}
