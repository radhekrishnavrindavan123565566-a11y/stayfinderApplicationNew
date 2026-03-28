import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeState {
  isDark: boolean;
  toggle: () => void;
}

function applyDark(isDark: boolean) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", isDark);
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: false,
      toggle: () =>
        set((s) => {
          const next = !s.isDark;
          applyDark(next);
          return { isDark: next };
        }),
    }),
    {
      name: "theme",
      onRehydrateStorage: () => (state) => {
        // After hydration from localStorage, sync the DOM class
        if (state) applyDark(state.isDark);
      },
    }
  )
);
