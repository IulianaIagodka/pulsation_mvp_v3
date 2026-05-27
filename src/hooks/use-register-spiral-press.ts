import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { useAppStore } from "../state/app-store";

/** Register spiral tap handler while this screen is focused (persistent overlay spiral). */
export function useRegisterSpiralPress(handler: (() => void) | null) {
  const setSpiralPressHandler = useAppStore((s) => s.setSpiralPressHandler);

  useFocusEffect(
    useCallback(() => {
      setSpiralPressHandler(handler);
      return () => setSpiralPressHandler(null);
    }, [handler, setSpiralPressHandler]),
  );
}
