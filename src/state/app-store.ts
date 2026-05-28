import { create } from "zustand";
import { InterventionType } from "../types/domain";

type AppState = {
  selectedIntervention?: InterventionType;
  findThreeVariantIndex?: number;
  spiralPressHandler: (() => void) | null;
  highContrastPreviewEnabled: boolean;
  setSelectedIntervention: (it: InterventionType) => void;
  setFindThreeVariantIndex: (index: number) => void;
  setSpiralPressHandler: (handler: (() => void) | null) => void;
  setHighContrastPreviewEnabled: (enabled: boolean) => void;
  clearIntervention: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  selectedIntervention: undefined,
  findThreeVariantIndex: undefined,
  spiralPressHandler: null,
  highContrastPreviewEnabled: false,
  setSelectedIntervention: (it) => set({ selectedIntervention: it }),
  setFindThreeVariantIndex: (index) => set({ findThreeVariantIndex: index }),
  setSpiralPressHandler: (handler) => set({ spiralPressHandler: handler }),
  setHighContrastPreviewEnabled: (enabled) => set({ highContrastPreviewEnabled: enabled }),
  clearIntervention: () => set({ selectedIntervention: undefined, findThreeVariantIndex: undefined }),
}));
