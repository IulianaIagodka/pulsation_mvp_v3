import { create } from "zustand";
import { InterventionType } from "../types/domain";

type AppState = {
  selectedIntervention?: InterventionType;
  findThreeVariantIndex?: number;
  circlesPressHandler: (() => void) | null;
  circlesPressHandlerOwnerId: number | null;
  highContrastPreviewEnabled: boolean;
  setSelectedIntervention: (it: InterventionType) => void;
  setFindThreeVariantIndex: (index: number) => void;
  setCirclesPressHandler: (ownerId: number, handler: (() => void) | null) => void;
  clearCirclesPressHandler: (ownerId: number) => void;
  setHighContrastPreviewEnabled: (enabled: boolean) => void;
  clearIntervention: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  selectedIntervention: undefined,
  findThreeVariantIndex: undefined,
  circlesPressHandler: null,
  circlesPressHandlerOwnerId: null,
  highContrastPreviewEnabled: false,
  setSelectedIntervention: (it) => set({ selectedIntervention: it }),
  setFindThreeVariantIndex: (index) => set({ findThreeVariantIndex: index }),
  setCirclesPressHandler: (ownerId, handler) =>
    set({ circlesPressHandler: handler, circlesPressHandlerOwnerId: ownerId }),
  clearCirclesPressHandler: (ownerId) =>
    set((state) =>
      state.circlesPressHandlerOwnerId === ownerId
        ? { circlesPressHandler: null, circlesPressHandlerOwnerId: null }
        : {},
    ),
  setHighContrastPreviewEnabled: (enabled) => set({ highContrastPreviewEnabled: enabled }),
  clearIntervention: () => set({ selectedIntervention: undefined, findThreeVariantIndex: undefined }),
}));
