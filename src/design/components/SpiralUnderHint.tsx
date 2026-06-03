import { uiCopy } from "../../modules/delivery-layer";
import type { SpiralHintPresentation } from "../../modules/spiral-hint-presentation";
import { ExplanationText } from "./ExplanationText";

type Props = {
  presentation: SpiralHintPresentation;
  visible?: boolean;
};

/** “Tap the spiral” — quiet label under the spiral rings. */
export function SpiralUnderHint({ presentation, visible = true }: Props) {
  if (!visible || !presentation.shouldShow) {
    return null;
  }

  return (
    <ExplanationText variant="hint" delayMs={presentation.delayMs} textOpacity={presentation.textOpacity}>
      {uiCopy.spiralHint}
    </ExplanationText>
  );
}
