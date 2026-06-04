import { useMemo } from "react";
import { Dimensions, useWindowDimensions } from "react-native";
import { initialWindowMetrics } from "react-native-safe-area-context";

const FALLBACK = initialWindowMetrics?.frame ?? Dimensions.get("window");

/** Avoid a first-frame anchor jump when `useWindowDimensions()` briefly returns zeros. */
export function useStableWindowDimensions() {
  const dims = useWindowDimensions();

  return useMemo(() => {
    if (dims.width > 0 && dims.height > 0) {
      return dims;
    }
    return FALLBACK;
  }, [dims.width, dims.height]);
}
