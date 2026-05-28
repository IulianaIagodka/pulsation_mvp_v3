import { useFocusEffect, usePathname } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { SpiralHintPresentation, getSpiralHintPresentation, getSpiralTapCount } from "../services/spiral-hint";

function getPathSalt(pathname: string): number {
  let hash = 0;
  for (let index = 0; index < pathname.length; index += 1) {
    hash = (hash + pathname.charCodeAt(index)) % 97;
  }
  return hash;
}

export function useSpiralHintPresentation(baseDelayMs: number): SpiralHintPresentation {
  const pathname = usePathname();
  const [spiralTapCount, setSpiralTapCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setSpiralTapCount(getSpiralTapCount());
    }, []),
  );

  return useMemo(
    () => getSpiralHintPresentation(spiralTapCount, baseDelayMs, getPathSalt(pathname)),
    [baseDelayMs, pathname, spiralTapCount],
  );
}
