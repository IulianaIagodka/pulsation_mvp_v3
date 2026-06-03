import { useFocusEffect, usePathname } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { getSchedulingProfile } from "../data/repositories/scheduling-profile-repo";
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
  const [completedCycles, setCompletedCycles] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setSpiralTapCount(getSpiralTapCount());
      setCompletedCycles(getSchedulingProfile().totalCompleted);
    }, []),
  );

  return useMemo(
    () => getSpiralHintPresentation(spiralTapCount, baseDelayMs, getPathSalt(pathname), completedCycles),
    [baseDelayMs, completedCycles, pathname, spiralTapCount],
  );
}
