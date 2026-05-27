import { SpiralFocus } from "./SpiralFocus";

type Props = { onPress?: () => void };

/** Same visual and rhythm as SpiralFocus — kept for intervention naming. */
export function FindThreeThingsSpiral(props: Props) {
  return <SpiralFocus {...props} />;
}
