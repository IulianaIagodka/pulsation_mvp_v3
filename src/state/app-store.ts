import { create } from "zustand";
import { InterventionType } from "../types/domain";

type AppState = {
  selectedIntervention?: InterventionType;
  setSelectedIntervention: (it: InterventionType) => void;
  clearIntervention: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  selectedIntervention: undefined,
  setSelectedIntervention: (it) => set({ selectedIntervention: it }),
  clearIntervention: () => set({ selectedIntervention: undefined }),
}));
