import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import type { CirclesHintPresentation } from "../../modules/circles-hint-presentation";
import { spacing } from "../tokens";
import { CirclesUnderHint } from "./CirclesUnderHint";

type Props = {
  presentation: CirclesHintPresentation;
  visible?: boolean;
  delayMs?: number;
  label?: string;
  revealId?: string;
  forceVisible?: boolean;
  holdAfterReveal?: boolean;
  reserveSlot?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Legacy inline slot — prefer `useRegisterCirclesHint` + `PersistentCirclesLayer`. */
export function InlineCirclesHintSlot({
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
  return (
    <View style={[styles.slot, style]}>
      <CirclesUnderHint
        presentation={presentation}
        visible={visible}
        delayMs={delayMs}
        label={label}
        holdAfterReveal={holdAfterReveal}
        revealId={revealId}
        forceVisible={forceVisible}
        reserveSlot={reserveSlot}
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
