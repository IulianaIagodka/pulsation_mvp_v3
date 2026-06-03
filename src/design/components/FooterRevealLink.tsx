import { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";
import { copyReveal } from "../animation-rhythm";
import { AboutFooterLink } from "./AboutFooterLink";

type Props = {
  label: string;
  onPress: () => void;
  delayMs?: number;
  /** Remount reveal when screen re-enters (e.g. trigger prompt key). */
  revealKey?: number;
};

/** Footer link that fades in on the same rhythm as main copy. */
export function FooterRevealLink({
  label,
  onPress,
  delayMs = copyReveal.delayMs,
  revealKey = 0,
}: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const hasRevealedRef = useRef(false);

  useEffect(() => {
    hasRevealedRef.current = false;
    opacity.setValue(0);

    let cancelled = false;
    const timer = setTimeout(() => {
      if (cancelled) return;
      Animated.timing(opacity, {
        toValue: 1,
        duration: copyReveal.fadeMs,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished && !cancelled) {
          hasRevealedRef.current = true;
        }
      });
    }, delayMs);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (!hasRevealedRef.current) {
        opacity.stopAnimation();
      }
    };
  }, [delayMs, opacity, revealKey]);

  return (
    <Animated.View style={{ opacity }}>
      <AboutFooterLink label={label} onPress={onPress} />
    </Animated.View>
  );
}
