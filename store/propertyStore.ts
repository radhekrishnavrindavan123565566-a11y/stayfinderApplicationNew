import { create } from "zustand";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";

export interface Property {
  _id: string;
  title: string;
  description: string;
  price: number;
  location: { address: string; city: string; state: string; country: string };
  images: string[];
  videos?: { interior?: string; exterior?: string };
  amenities: string[];
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  ownerId: { _id: string; username: string; avatar?: string; email: string };
  isAvailable: boolean;
  averageRating: number;
  totalReviews: number;
  isFeatured: boolean;
  isBoosted: boolean;
  boostExpiresAt?: string;
  instantBooking: boolean;
  cancellationPolicy: "flexible" | "moderate" | "strict";
  ownerVerified: boolean;
  createdAt: string;
}

interface Filters {
  search: string;
  city: string;
  minPrice: string;
  maxPrice: string;
  propertyType: string;
  bedrooms: string;
}

interface PropertyState {
  properties: Property[];
  total: number;
  page: number;
  pages: number;
  isLoading: boolean;
  filters: Filters;
  setFilters: (filters: Partial<Filters>) => void;
  fetchProperties: (page?: number) => Promise<void>;
}

export const usePropertyStore = create<PropertyState>((set, get) => ({
  properties: [],
  total: 0,
  page: 1,
  pages: 1,
  isLoading: false,
  filters: { search: "", city: "", minPrice: "", maxPrice: "", propertyType: "", bedrooms: "" },

  setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters } })),

  fetchProperties: async (page = 1) => {
    set({ isLoading: true });
    try {
      const { filters } = get();
      const params = new URLSearchParams({ page: String(page) });
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
      // Exclude properties already booked by this tenant
      const currentUser = useAuthStore.getState().user;
      if (currentUser?.role === "tenant") {
        params.set("excludeBooked", currentUser._id);
      }
      const { data } = await axios.get(`/api/properties?${params}`);
      set({ properties: data.data.properties, total: data.data.total, page: data.data.page, pages: data.data.pages });
    } finally {
      set({ isLoading: false });
    }
  },
}));
