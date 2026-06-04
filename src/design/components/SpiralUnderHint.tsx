import { StyleProp, ViewStyle, type EasingFunction } from "react-native";
import { uiCopy } from "../../modules/delivery-layer";
import type { SpiralHintPresentation } from "../../modules/spiral-hint-presentation";
import { ExplanationText } from "./ExplanationText";

type Props = {
  presentation: SpiralHintPresentation;
  visible?: boolean;
  /** Overrides `presentation.delayMs` (e.g. onboarding: always last line). */
  delayMs?: number;
  fadeMs?: number;
  fadeEasing?: EasingFunction;
  /** Defaults to `uiCopy.spiralHint` (short, under-spiral). Onboarding uses `uiCopy.onboardingSpiralHint` inline. */
  label?: string;
  style?: StyleProp<ViewStyle>;
  /** Onboarding: same rhythm as body copy. Other screens: quiet label under the spiral. */
  placement?: "inline" | "underSpiral";
  holdAfterReveal?: boolean;
  revealId?: string;
  forceVisible?: boolean;
};

/** “Tap the spiral” — under the spiral on flow screens; inline after copy on onboarding. */
export function SpiralUnderHint({
  presentation,
  visible = true,
  delayMs,
  fadeMs,
  fadeEasing,
  label,
  style,
  placement = "underSpiral",
  holdAfterReveal = false,
  revealId,
  forceVisible = false,
}: Props) {
  if (!visible || !presentation.shouldShow) {
    return null;
  }

  const isInline = placement === "inline";

  return (
    <ExplanationText
      variant={isInline ? "explanation" : "hint"}
      delayMs={delayMs ?? presentation.delayMs}
      fadeMs={fadeMs}
      fadeEasing={fadeEasing}
      textOpacity={isInline ? undefined : presentation.textOpacity}
      style={style}
      holdAfterReveal={holdAfterReveal}
      revealId={revealId}
      forceVisible={forceVisible}
    >
      {label ?? uiCopy.spiralHint}
    </ExplanationText>
  );
}
