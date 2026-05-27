import {
  FIND_THREE_VARIANT_COUNT,
  getFindThreeVariant,
  pickNextFindThreeVariantIndex,
} from "./find-three-variants";

describe("find-three-variants", () => {
  it("defines exactly 7 combinations per locale", () => {
    expect(FIND_THREE_VARIANT_COUNT).toBe(7);
    for (let i = 0; i < 7; i += 1) {
      expect(getFindThreeVariant(i, "en").items).toHaveLength(3);
      expect(getFindThreeVariant(i, "uk").items).toHaveLength(3);
    }
  });

  it("never picks the same index as last when last is valid", () => {
    for (let last = 0; last < FIND_THREE_VARIANT_COUNT; last += 1) {
      for (let trial = 0; trial < 40; trial += 1) {
        const next = pickNextFindThreeVariantIndex(last);
        expect(next).not.toBe(last);
        expect(next).toBeGreaterThanOrEqual(0);
        expect(next).toBeLessThan(FIND_THREE_VARIANT_COUNT);
      }
    }
  });
});
