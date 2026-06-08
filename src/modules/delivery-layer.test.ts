jest.mock("expo-localization", () => ({
  getLocales: () => [{ languageCode: "en" }],
}));

import { ALL_INTERVENTIONS } from "../interventions/registry";
import {
  __deliveryLayerCopyForTests,
  FIND_THREE_VARIANT_COUNT,
  getFindThreeVariant,
  pickNextFindThreeVariantIndex,
} from "./delivery-layer";

const {
  interventionLabelsByLocale,
  guidanceByLocale,
  findThreeCopyByLocale,
  explanationPoolByLocale,
  triangleBreathCopyByLocale,
  uiCopyByLocale,
} = __deliveryLayerCopyForTests;

function expectMatchingKeys(left: object, right: object) {
  expect(Object.keys(left).sort()).toEqual(Object.keys(right).sort());
}

describe("delivery-layer copy", () => {
  it("keeps en/uk intervention label keys in parity", () => {
    expectMatchingKeys(interventionLabelsByLocale.en, interventionLabelsByLocale.uk);
    expect(Object.keys(interventionLabelsByLocale.en).sort()).toEqual([...ALL_INTERVENTIONS].sort());
  });

  it("keeps en/uk simple guidance keys in parity", () => {
    expectMatchingKeys(guidanceByLocale.en, guidanceByLocale.uk);
  });

  it("keeps en/uk explanation pool keys and sizes in parity", () => {
    expectMatchingKeys(explanationPoolByLocale.en, explanationPoolByLocale.uk);
    for (const id of ALL_INTERVENTIONS) {
      expect(explanationPoolByLocale.en[id]).toHaveLength(explanationPoolByLocale.uk[id].length);
    }
  });

  it("keeps en/uk find-three variant structure in parity", () => {
    const en = findThreeCopyByLocale.en;
    const uk = findThreeCopyByLocale.uk;
    expect(en.variants).toHaveLength(uk.variants.length);
    for (let i = 0; i < en.variants.length; i += 1) {
      expect(en.variants[i]!.items).toHaveLength(uk.variants[i]!.items.length);
    }
  });

  it("keeps en/uk triangle breath phase keys in parity", () => {
    expectMatchingKeys(triangleBreathCopyByLocale.en.phases, triangleBreathCopyByLocale.uk.phases);
  });

  it("keeps en/uk uiCopy keys and list lengths in parity", () => {
    expectMatchingKeys(uiCopyByLocale.en, uiCopyByLocale.uk);
    expect(uiCopyByLocale.en.onboardingSteps).toHaveLength(uiCopyByLocale.uk.onboardingSteps.length);
    expect(uiCopyByLocale.en.aboutParagraphs).toHaveLength(uiCopyByLocale.uk.aboutParagraphs.length);
  });

  it("defines exactly 7 find-three combinations per locale", () => {
    expect(FIND_THREE_VARIANT_COUNT).toBe(7);
    for (let i = 0; i < 7; i += 1) {
      expect(getFindThreeVariant(i, "en").items).toHaveLength(3);
      expect(getFindThreeVariant(i, "uk").items).toHaveLength(3);
    }
  });

  it("never picks the same find-three index as last when last is valid", () => {
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
