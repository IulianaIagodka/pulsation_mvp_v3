import { useEffect, useLayoutEffect, useRef } from "react";
import { Animated, type EasingFunction } from "react-native";
import { Easing } from "react-native";
import { hasFlowCopyRevealed, markFlowCopyRevealed, markFlowCopyShown, shouldInstantFlowReveal } from "./flow-copy-reveal";
import { flowRevealIds } from "./flow-reveal-ids";
import { useHintSessionEpoch } from "../hooks/use-hint-session-epoch";
import { shouldPersistFlowTapHint } from "../modules/circles-hint-presentation";

type Options = {
  opacity: Animated.Value;
  delayMs: number;
  fadeMs: number;
  fadeEasing?: EasingFunction;
  holdAfterReveal?: boolean;
  revealId?: string;
  /** When true, snap visible immediately (e.g. trigger regains focus after return). */
  forceVisible?: boolean;
};

const DEFAULT_EASING = Easing.out(Easing.quad);

export function useFlowCopyReveal({
  opacity,
  delayMs,
  fadeMs,
  fadeEasing = DEFAULT_EASING,
  holdAfterReveal = false,
  revealId,
  forceVisible = false,
}: Options) {
  const hasRevealedRef = useRef(false);
  const fadeEasingRef = useRef(fadeEasing);
  fadeEasingRef.current = fadeEasing;
  const hintSessionEpoch = useHintSessionEpoch();

  useLayoutEffect(() => {
    const instant = forceVisible || (revealId != null && shouldInstantFlowReveal(revealId, false));
    if (instant) {
      opacity.setValue(1);
      hasRevealedRef.current = true;
      if (forceVisible && revealId) {
        markFlowCopyRevealed(revealId);
      }
    }
  }, [forceVisible, opacity, revealId]);

  useEffect(() => {
    if (forceVisible) {
      opacity.setValue(1);
      hasRevealedRef.current = true;
      if (revealId) {
        markFlowCopyRevealed(revealId);
      }
      return;
    }

    if (holdAfterReveal && hasRevealedRef.current) {
      opacity.setValue(1);
      return;
    }

    if (
      holdAfterReveal &&
      revealId != null &&
      hasFlowCopyRevealed(revealId) &&
      (revealId !== flowRevealIds.flowCirclesHint || shouldPersistFlowTapHint())
    ) {
      opacity.setValue(1);
      hasRevealedRef.current = true;
      return;
    }

    if (revealId && shouldInstantFlowReveal(revealId, false)) {
      opacity.setValue(1);
      hasRevealedRef.current = true;
      return;
    }

    let cancelled = false;
    opacity.setValue(0);

    const timer = setTimeout(() => {
      if (cancelled) return;
      if (revealId) {
        markFlowCopyShown(revealId);
      }
      Animated.timing(opacity, {
        toValue: 1,
        duration: fadeMs,
        easing: fadeEasingRef.current,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!finished || cancelled) return;
        hasRevealedRef.current = true;
        if (revealId) {
          markFlowCopyRevealed(revealId);
        }
      });
    }, delayMs);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (!holdAfterReveal || !hasRevealedRef.current) {
        opacity.stopAnimation();
      }
    };
  }, [delayMs, fadeMs, forceVisible, hintSessionEpoch, holdAfterReveal, opacity, revealId]);
}
