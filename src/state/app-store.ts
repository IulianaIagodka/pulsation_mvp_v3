import { create } from "zustand";
import { InterventionType } from "../types/domain";

type AppState = {
  selectedIntervention?: InterventionType;
  findThreeVariantIndex?: number;
  setSelectedIntervention: (it: InterventionType) => void;
  setFindThreeVariantIndex: (index: number) => void;
  clearIntervention: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  selectedIntervention: undefined,
  findThreeVariantIndex: undefined,
  setSelectedIntervention: (it) => set({ selectedIntervention: it }),
  setFindThreeVariantIndex: (index) => set({ findThreeVariantIndex: index }),
  clearIntervention: () => set({ selectedIntervention: undefined, findThreeVariantIndex: undefined }),
}));
