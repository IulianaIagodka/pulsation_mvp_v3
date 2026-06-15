import { useFocusEffect } from "expo-router";
import { useCallback, useRef } from "react";
import { useAppStore } from "../state/app-store";
import { playCirclesTapHaptic } from "../services/haptic-regulation";
import { recordCirclesTap } from "../services/circles-hint";

let nextCirclesPressOwnerId = 1;

/** Register circles tap handler while this screen is focused (persistent overlay). */
export function useRegisterCirclesPress(handler: (() => void) | null) {
  const setCirclesPressHandler = useAppStore((s) => s.setCirclesPressHandler);
  const clearCirclesPressHandler = useAppStore((s) => s.clearCirclesPressHandler);
  const ownerIdRef = useRef<number | null>(null);
  if (ownerIdRef.current == null) {
    ownerIdRef.current = nextCirclesPressOwnerId;
    nextCirclesPressOwnerId += 1;
  }
  const ownerId = ownerIdRef.current;

  const wrappedHandler = useCallback(() => {
    if (!handler) return;
    playCirclesTapHaptic();
    recordCirclesTap("flow");
    handler();
  }, [handler]);

  useFocusEffect(
    useCallback(() => {
      setCirclesPressHandler(ownerId, handler ? wrappedHandler : null);
      return () => clearCirclesPressHandler(ownerId);
    }, [clearCirclesPressHandler, handler, ownerId, setCirclesPressHandler, wrappedHandler]),
  );
}
