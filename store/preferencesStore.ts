import { create } from "zustand";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";

export interface UserPreferencesData {
  _id?: string;
  userId?: string;
  budget: { min: number; max: number };
  preferredBedrooms: number;
  preferredAmenities: string[];
  preferredCities: string[];
  tenantType: "student" | "family" | "professional" | "couple";
}

interface PreferencesState {
  preferences: UserPreferencesData | null;
  isLoading: boolean;
  fetchPreferences: () => Promise<void>;
  updatePreferences: (data: Partial<UserPreferencesData>) => Promise<void>;
}

export const usePreferencesStore = create<PreferencesState>((set) => ({
  preferences: null,
  isLoading: false,

  fetchPreferences: async () => {
    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().accessToken;
      const { data } = await axios.get("/api/user/preferences", {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ preferences: data.data.preferences });
    } catch {
      // silent fail
    } finally {
      set({ isLoading: false });
    }
  },

  updatePreferences: async (updates) => {
    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().accessToken;
      const { data } = await axios.put("/api/user/preferences", updates, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ preferences: data.data.preferences });
    } finally {
      set({ isLoading: false });
    }
  },
}));
