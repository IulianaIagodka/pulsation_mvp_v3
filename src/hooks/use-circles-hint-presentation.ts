import { useMemo } from "react";
import { CirclesHintPresentation, getCirclesHintPresentation } from "../modules/circles-hint-presentation";

export function useCirclesHintPresentation(baseDelayMs: number): CirclesHintPresentation {
  return useMemo(() => getCirclesHintPresentation(baseDelayMs), [baseDelayMs]);
}
