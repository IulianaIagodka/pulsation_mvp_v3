export const FIND_THREE_VARIANT_COUNT = 7;

export type FindThreeLocale = "en" | "uk";

export type FindThreeVariant = {
  items: readonly [string, string, string];
};

/**
 * Seven sets — only words from the approved calm-vocabulary list.
 * Each line: shape · color · feel.
 */
const variantsByLocale = {
  en: [
    { items: ["something round", "something blue", "something soft"] },
    { items: ["something straight", "something green", "something smooth"] },
    { items: ["something still", "something dark", "something calm"] },
    { items: ["something small", "something bright", "something gentle"] },
    { items: ["something familiar", "something warm", "something comfortable"] },
    { items: ["something solid", "something natural", "something steady"] },
    { items: ["something tiny", "something cold", "something quiet"] },
  ],
  uk: [
    { items: ["щось кругле", "щось синє", "щось м’яке"] },
    { items: ["щось пряме", "щось зелене", "щось гладке"] },
    { items: ["щось нерухоме", "щось темне", "щось спокійне"] },
    { items: ["щось маленьке", "щось яскраве", "щось ніжне"] },
    { items: ["щось знайоме", "щось тепле", "щось зручне"] },
    { items: ["щось тверде", "щось природне", "щось стійке"] },
    { items: ["щось крихітне", "щось холодне", "щось тихе"] },
  ],
} as const satisfies Record<"en" | "uk", readonly FindThreeVariant[]>;

export function getFindThreeIntro(locale: FindThreeLocale): string {
  return locale === "uk" ? "Знайди 3 речі навколо себе:" : "Find 3 things around you:";
}

export function getFindThreeVariant(variantIndex: number, locale: FindThreeLocale): FindThreeVariant {
  const list = variantsByLocale[locale];
  const normalized = ((variantIndex % list.length) + list.length) % list.length;
  return list[normalized]!;
}

/** Pick 0..6, never the same as `lastIndex` when that index is valid. */
export function pickNextFindThreeVariantIndex(lastIndex: number | undefined): number {
  if (
    lastIndex === undefined ||
    lastIndex < 0 ||
    lastIndex >= FIND_THREE_VARIANT_COUNT ||
    !Number.isInteger(lastIndex)
  ) {
    return Math.floor(Math.random() * FIND_THREE_VARIANT_COUNT);
  }
  const candidates = Array.from({ length: FIND_THREE_VARIANT_COUNT }, (_, i) => i).filter(
    (i) => i !== lastIndex,
  );
  return candidates[Math.floor(Math.random() * candidates.length)]!;
}

