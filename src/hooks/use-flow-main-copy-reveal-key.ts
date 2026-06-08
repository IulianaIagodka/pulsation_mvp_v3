import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { isInstantTriggerReturnActive } from "../design/flow-copy-reveal";

/** Remount flow main copy on refocus so fade-in replays (trigger / action / return). */
export function useFlowMainCopyRevealKey() {
  const hasFocusedOnceRef = useRef(false);
  const [copyRevealKey, setCopyRevealKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      if (hasFocusedOnceRef.current && !isInstantTriggerReturnActive()) {
        setCopyRevealKey((key) => key + 1);
      } else {
        hasFocusedOnceRef.current = true;
      }
    }, []),
  );

  return copyRevealKey;
}
