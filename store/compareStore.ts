import { create } from "zustand";

interface CompareState {
  ids: string[];
  add: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  has: (id: string) => boolean;
}

export const useCompareStore = create<CompareState>((set, get) => ({
  ids: [],
  add: (id) => {
    if (get().ids.length >= 3) return; // max 3
    if (!get().ids.includes(id)) set((s) => ({ ids: [...s.ids, id] }));
  },
  remove: (id) => set((s) => ({ ids: s.ids.filter((i) => i !== id) })),
  clear: () => set({ ids: [] }),
  has: (id) => get().ids.includes(id),
}));
