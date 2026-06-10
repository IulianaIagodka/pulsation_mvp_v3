import { useRef } from "react";
import { getFlowMainCopyDelayMs } from "../design/flow-screen-transition";

/** Consume stacked entry delay once per screen mount — not on refocus. */
export function useFlowMainCopyDelayMs(): number {
  const delayRef = useRef<number | null>(null);
  if (delayRef.current === null) {
    delayRef.current = getFlowMainCopyDelayMs();
  }
  return delayRef.current;
}
