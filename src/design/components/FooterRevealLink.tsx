import { useRef } from "react";
import { Animated } from "react-native";
import { copyReveal } from "../animation-rhythm";
import { shouldInstantFlowReveal } from "../flow-copy-reveal";
import { useFlowCopyReveal } from "../use-flow-copy-reveal";
import { AboutFooterLink } from "./AboutFooterLink";

type Props = {
  label: string;
  onPress: () => void;
  delayMs?: number;
  holdAfterReveal?: boolean;
  revealId?: string;
  forceVisible?: boolean;
};

/** Footer link that fades in on the same rhythm as main copy. */
export function FooterRevealLink({
  label,
  onPress,
  delayMs = copyReveal.delayMs,
  holdAfterReveal = false,
  revealId,
  forceVisible = false,
}: Props) {
  const instant = shouldInstantFlowReveal(revealId, forceVisible);
  const opacity = useRef(new Animated.Value(instant ? 1 : 0)).current;

  useFlowCopyReveal({
    opacity,
    delayMs,
    fadeMs: copyReveal.fadeMs,
    holdAfterReveal,
    revealId,
    forceVisible: instant,
  });

  if (instant) {
    return <AboutFooterLink label={label} onPress={onPress} />;
  }

  return (
    <Animated.View style={{ opacity }}>
      <AboutFooterLink label={label} onPress={onPress} />
    </Animated.View>
  );
}
