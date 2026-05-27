import { getOutcomesProfile, saveOutcomesProfile } from "../data/repositories/outcomes-repo";
import { pickNextFindThreeVariantIndex } from "../modules/find-three-variants";

/** Persist and return the next variant index for this “find 3” session. */
export function assignNextFindThreeVariant(): number {
  const profile = getOutcomesProfile();
  const index = pickNextFindThreeVariantIndex(profile.lastFindThreeVariantIndex);
  saveOutcomesProfile({ ...profile, lastFindThreeVariantIndex: index });
  return index;
}
