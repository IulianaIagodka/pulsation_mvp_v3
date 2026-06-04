import { PixelRatio, StyleProp, StyleSheet, View, ViewStyle, useWindowDimensions } from "react-native";
import type { SpiralHintPresentation } from "../../modules/spiral-hint-presentation";
import { getInlineHintSlotHeight } from "../spiral-anchor-layout";
import { spacing } from "../tokens";
import { SpiralUnderHint } from "./SpiralUnderHint";

type Props = {
  presentation: SpiralHintPresentation;
  visible?: boolean;
  delayMs?: number;
  label?: string;
  revealId?: string;
  forceVisible?: boolean;
  holdAfterReveal?: boolean;
  /** Keep layout stable before hint fades in (default true on flow screens). */
  reserveSlot?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Inline “tap the spiral” below main copy — reserved slot keeps layout from shifting. */
export function InlineSpiralHintSlot({
  presentation,
  visible = true,
  delayMs,
  label,
  revealId,
  forceVisible = false,
  holdAfterReveal = false,
  reserveSlot = true,
  style,
}: Props) {
  const { width } = useWindowDimensions();
  const slotHeight = getInlineHintSlotHeight(width, PixelRatio.getFontScale());

  return (
    <View
      style={[
        styles.slot,
        reserveSlot && presentation.shouldShow ? { minHeight: slotHeight } : null,
        style,
      ]}
    >
      <SpiralUnderHint
        presentation={presentation}
        visible={visible}
        delayMs={delayMs}
        label={label}
        placement="inline"
        holdAfterReveal={holdAfterReveal}
        revealId={revealId}
        forceVisible={forceVisible}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    width: "100%",
    alignItems: "center",
    marginTop: spacing.sm,
  },
});
