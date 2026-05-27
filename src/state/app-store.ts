import { create } from "zustand";
import { InterventionType } from "../types/domain";

type AppState = {
  selectedIntervention?: InterventionType;
  findThreeVariantIndex?: number;
  spiralPressHandler: (() => void) | null;
  setSelectedIntervention: (it: InterventionType) => void;
  setFindThreeVariantIndex: (index: number) => void;
  setSpiralPressHandler: (handler: (() => void) | null) => void;
  clearIntervention: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  selectedIntervention: undefined,
  findThreeVariantIndex: undefined,
  spiralPressHandler: null,
  setSelectedIntervention: (it) => set({ selectedIntervention: it }),
  setFindThreeVariantIndex: (index) => set({ findThreeVariantIndex: index }),
  setSpiralPressHandler: (handler) => set({ spiralPressHandler: handler }),
  clearIntervention: () => set({ selectedIntervention: undefined, findThreeVariantIndex: undefined }),
}));
