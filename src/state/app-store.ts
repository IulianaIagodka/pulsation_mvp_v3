import { create } from "zustand";
import { InterventionType } from "../types/domain";

type AppState = {
  selectedIntervention?: InterventionType;
  findThreeVariantIndex?: number;
  circlesPressHandler: (() => void) | null;
  highContrastPreviewEnabled: boolean;
  setSelectedIntervention: (it: InterventionType) => void;
  setFindThreeVariantIndex: (index: number) => void;
  setCirclesPressHandler: (handler: (() => void) | null) => void;
  setHighContrastPreviewEnabled: (enabled: boolean) => void;
  clearIntervention: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  selectedIntervention: undefined,
  findThreeVariantIndex: undefined,
  circlesPressHandler: null,
  highContrastPreviewEnabled: false,
  setSelectedIntervention: (it) => set({ selectedIntervention: it }),
  setFindThreeVariantIndex: (index) => set({ findThreeVariantIndex: index }),
  setCirclesPressHandler: (handler) => set({ circlesPressHandler: handler }),
  setHighContrastPreviewEnabled: (enabled) => set({ highContrastPreviewEnabled: enabled }),
  clearIntervention: () => set({ selectedIntervention: undefined, findThreeVariantIndex: undefined }),
}));
