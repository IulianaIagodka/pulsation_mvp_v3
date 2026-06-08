import { useSyncExternalStore } from "react";
import { getHintSessionEpoch, subscribeHintSession } from "../design/flow-copy-reveal";

/** Re-render when flow tap hint session state changes (shown / dismissed). */
export function useHintSessionEpoch(): number {
  return useSyncExternalStore(subscribeHintSession, getHintSessionEpoch, getHintSessionEpoch);
}
