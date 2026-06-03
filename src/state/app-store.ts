import { create } from "zustand";
import { InterventionType } from "../types/domain";
import type { SpiralUnderHintSlot } from "../types/spiral-under-hint";

type AppState = {
  selectedIntervention?: InterventionType;
  findThreeVariantIndex?: number;
  spiralPressHandler: (() => void) | null;
  spiralUnderHint: SpiralUnderHintSlot | null;
  highContrastPreviewEnabled: boolean;
  setSelectedIntervention: (it: InterventionType) => void;
  setFindThreeVariantIndex: (index: number) => void;
  setSpiralPressHandler: (handler: (() => void) | null) => void;
  setSpiralUnderHint: (slot: SpiralUnderHintSlot | null) => void;
  setHighContrastPreviewEnabled: (enabled: boolean) => void;
  clearIntervention: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  selectedIntervention: undefined,
  findThreeVariantIndex: undefined,
  spiralPressHandler: null,
  spiralUnderHint: null,
  highContrastPreviewEnabled: false,
  setSelectedIntervention: (it) => set({ selectedIntervention: it }),
  setFindThreeVariantIndex: (index) => set({ findThreeVariantIndex: index }),
  setSpiralPressHandler: (handler) => set({ spiralPressHandler: handler }),
  setSpiralUnderHint: (slot) => set({ spiralUnderHint: slot }),
  setHighContrastPreviewEnabled: (enabled) => set({ highContrastPreviewEnabled: enabled }),
  clearIntervention: () => set({ selectedIntervention: undefined, findThreeVariantIndex: undefined }),
}));
