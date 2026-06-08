import { useFocusEffect, usePathname } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { getSchedulingProfile } from "../data/repositories/scheduling-profile-repo";
import { CirclesHintPresentation, getCirclesHintPresentation, getCirclesTapCount } from "../services/circles-hint";
import {
  isLastGraceReturnCycle,
  shouldShowTapHint,
  withLastGraceReturnTapHint,
} from "../modules/circles-hint-presentation";
import { dismissFlowCirclesHint } from "../design/flow-copy-reveal";

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
  const [hintRevealedAtCycle, setHintRevealedAtCycle] = useState(
    () => getSchedulingProfile().tapHintRevealedAtCycle ?? null,
  );

  useFocusEffect(
    useCallback(() => {
      const profile = getSchedulingProfile();
      const hintAtCycle = profile.tapHintRevealedAtCycle ?? null;
      setCirclesTapCount(getCirclesTapCount());
      setCompletedCycles(profile.totalCompleted);
      setHintRevealedAtCycle(hintAtCycle);

      const onLastGraceReturn =
        pathname === "/return" &&
        isLastGraceReturnCycle(profile.totalCompleted, hintAtCycle);
      if (
        hintAtCycle != null &&
        !shouldShowTapHint(profile.totalCompleted, hintAtCycle) &&
        !onLastGraceReturn
      ) {
        dismissFlowCirclesHint();
      }
    }, [pathname]),
  );

  return useMemo(() => {
    const presentation = getCirclesHintPresentation(
      circlesTapCount,
      baseDelayMs,
      getPathSalt(pathname),
      completedCycles,
      hintRevealedAtCycle,
    );
    if (pathname === "/return") {
      return withLastGraceReturnTapHint(presentation, completedCycles, hintRevealedAtCycle);
    }
    return presentation;
  }, [baseDelayMs, completedCycles, hintRevealedAtCycle, pathname, circlesTapCount]);
}
