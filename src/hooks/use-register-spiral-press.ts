import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { useAppStore } from "../state/app-store";
import { recordSpiralTap } from "../services/spiral-hint";

/** Register spiral tap handler while this screen is focused (persistent overlay spiral). */
export function useRegisterSpiralPress(handler: (() => void) | null) {
  const setSpiralPressHandler = useAppStore((s) => s.setSpiralPressHandler);
  const wrappedHandler = useCallback(() => {
    if (!handler) return;
    recordSpiralTap("flow");
    handler();
  }, [handler]);

  useFocusEffect(
    useCallback(() => {
      setSpiralPressHandler(handler ? wrappedHandler : null);
      return () => setSpiralPressHandler(null);
    }, [handler, setSpiralPressHandler, wrappedHandler]),
  );
}
