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
  /** Defaults to `uiCopy.spiralHint` (short text under the circles). */
  label?: string;
  style?: StyleProp<ViewStyle>;
  holdAfterReveal?: boolean;
  revealId?: string;
  forceVisible?: boolean;
};

/** Hint text rendered under the circles in the fixed circles block. */
export function SpiralUnderHint({
  presentation,
  visible = true,
  delayMs,
  fadeMs,
  fadeEasing,
  label,
  style,
  holdAfterReveal = false,
  revealId,
  forceVisible = false,
}: Props) {
  if (!visible || !presentation.shouldShow) {
    return null;
  }

  return (
    <ExplanationText
      variant="hint"
      delayMs={delayMs ?? presentation.delayMs}
      fadeMs={fadeMs}
      fadeEasing={fadeEasing}
      textOpacity={presentation.textOpacity}
      style={style}
      holdAfterReveal={holdAfterReveal}
      revealId={revealId}
      forceVisible={forceVisible}
    >
      {label ?? uiCopy.spiralHint}
    </ExplanationText>
  );
}
