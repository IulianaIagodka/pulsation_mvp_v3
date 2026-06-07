import { useFocusEffect, usePathname } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { getSchedulingProfile } from "../data/repositories/scheduling-profile-repo";
import { CirclesHintPresentation, getCirclesHintPresentation, getCirclesTapCount } from "../services/circles-hint";

function getPathSalt(pathname: string): number {
  let hash = 0;
  for (let index = 0; index < pathname.length; index += 1) {
    hash = (hash + pathname.charCodeAt(index)) % 97;
  }
  return hash;
}

export function useCirclesHintPresentation(baseDelayMs: number): CirclesHintPresentation {
  const pathname = usePathname();
  const [circlesTapCount, setCirclesTapCount] = useState(() => getCirclesTapCount());
  const [completedCycles, setCompletedCycles] = useState(
    () => getSchedulingProfile().totalCompleted,
  );

  useFocusEffect(
    useCallback(() => {
      setCirclesTapCount(getCirclesTapCount());
      setCompletedCycles(getSchedulingProfile().totalCompleted);
    }, []),
  );

  return useMemo(
    () => getCirclesHintPresentation(circlesTapCount, baseDelayMs, getPathSalt(pathname), completedCycles),
    [baseDelayMs, completedCycles, pathname, circlesTapCount],
  );
}
