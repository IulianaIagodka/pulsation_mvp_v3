import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";
import { useAppStore } from "../state/app-store";

/**
 * Use a stronger contrast profile when transparency reduction is enabled.
 * This is a practical proxy for low-visibility scenarios on mobile screens.
 */
export function useHighContrast(): boolean {
  const [highContrast, setHighContrast] = useState(false);
  const highContrastPreviewEnabled = useAppStore((s) => s.highContrastPreviewEnabled);

  useEffect(() => {
    let mounted = true;

    AccessibilityInfo.isReduceTransparencyEnabled()
      .then((enabled) => {
        if (mounted) setHighContrast(enabled);
      })
      .catch(() => {
        if (mounted) setHighContrast(false);
      });

    const subscription = AccessibilityInfo.addEventListener("reduceTransparencyChanged", setHighContrast);
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return highContrast || (__DEV__ && highContrastPreviewEnabled);
}
