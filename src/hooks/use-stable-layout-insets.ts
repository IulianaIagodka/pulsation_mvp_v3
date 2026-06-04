import { useMemo } from "react";
import { initialWindowMetrics, useSafeAreaInsets } from "react-native-safe-area-context";

const FALLBACK_INSETS = initialWindowMetrics?.insets ?? {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
};

/** Avoid a first-frame layout jump when `useSafeAreaInsets()` briefly returns zeros. */
export function useStableLayoutInsets() {
  const insets = useSafeAreaInsets();

  return useMemo(() => {
    const allZero =
      insets.top === 0 &&
      insets.bottom === 0 &&
      insets.left === 0 &&
      insets.right === 0;

    if (!allZero) {
      return insets;
    }

    return FALLBACK_INSETS;
  }, [insets.top, insets.bottom, insets.left, insets.right]);
}
