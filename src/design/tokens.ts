/** Lighten a hex color toward white by `amount` (0–1). Background stays at base values. */
function lighten(hex: string, amount: number): string {
  const raw = hex.replace("#", "");
  const r = parseInt(raw.slice(0, 2), 16);
  const g = parseInt(raw.slice(2, 4), 16);
  const b = parseInt(raw.slice(4, 6), 16);
  const mix = (channel: number) => Math.round(channel + (255 - channel) * amount);
  const toHex = (channel: number) => channel.toString(16).padStart(2, "0");
  return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`;
}

const base = {
  backgroundPrimary: "#070D18",
  backgroundSecondary: "#0A1222",
  spiralOuter: "#2F4366",
  spiralInner: "#162238",
  spiralInnerAlt: "#111C2F",
  spiralRing: "#314765",
  surfacePrimary: "#101A2B",
  surfaceSecondary: "#162236",
  textPrimary: "#BCC8DA",
  textSecondary: "#74839A",
  borderSoft: "#1E2F49",
} as const;

const spiralLift = 0.2;
const textPrimaryLift = 0.28;
const textSecondaryLift = 0.24;

export const colors = {
  backgroundPrimary: base.backgroundPrimary,
  backgroundSecondary: base.backgroundSecondary,
  spiralOuter: lighten(base.spiralOuter, spiralLift),
  spiralInner: lighten(base.spiralInner, spiralLift),
  spiralInnerAlt: lighten(base.spiralInnerAlt, spiralLift),
  spiralRing: lighten(base.spiralRing, spiralLift),
  spiralRingHighlight: lighten(base.spiralRing, spiralLift + 0.14),
  surfacePrimary: base.surfacePrimary,
  surfaceSecondary: base.surfaceSecondary,
  textPrimary: lighten(base.textPrimary, textPrimaryLift),
  textSecondary: lighten(base.textSecondary, textSecondaryLift),
  borderSoft: base.borderSoft,
} as const;

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const typography = {
  body: 17,
  small: 14,
  gentle: 20,
} as const;
