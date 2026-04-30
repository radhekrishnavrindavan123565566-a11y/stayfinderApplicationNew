import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

export interface User {
  _id: string;
  username: string;
  email: string;
  role: "tenant" | "owner" | "admin";
  avatar?: string;
  wishlist: string[];
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { username: string; email: string; password: string; role: string }) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  toggleWishlist: (propertyId: string) => Promise<void>;
}

// Axios interceptor: auto-refresh access token on 401
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
}

axios.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const isAuthEndpoint = original?.url?.includes("/api/auth/");
    if (error.response?.status === 401 && !original._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers["Authorization"] = `Bearer ${token}`;
          return axios(original);
        });
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const storedRefreshToken = useAuthStore.getState().refreshToken;
        const { data } = await axios.post(
          "/api/auth/refresh",
          storedRefreshToken ? { refreshToken: storedRefreshToken } : {},
          { withCredentials: true }
        );
        const newAccessToken = data.data.accessToken;
        const newRefreshToken = data.data.refreshToken;
        useAuthStore.getState().setAccessToken(newAccessToken);
        if (newRefreshToken) {
          useAuthStore.setState({ refreshToken: newRefreshToken });
        }
        processQueue(null, newAccessToken);
        original.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return axios(original);
      } catch (err) {
        processQueue(err, null);
        if (axios.isAxiosError(err) && (err.response?.status === 401 || err.response?.status === 403)) {
          useAuthStore.setState({ user: null, accessToken: null, refreshToken: null });
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      _hasHydrated: false,

      setHasHydrated: (state) => set({ _hasHydrated: state }),
      setUser: (user) => set({ user }),
      setAccessToken: (token) => set({ accessToken: token }),

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await axios.post("/api/auth/login", { email, password });
          set({
            user: data.data.user,
            accessToken: data.data.accessToken,
            refreshToken: data.data.refreshToken,
          });
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (formData) => {
        set({ isLoading: true });
        try {
          const { data } = await axios.post("/api/auth/register", formData);
          set({
            user: data.data.user,
            accessToken: data.data.accessToken,
            refreshToken: data.data.refreshToken,
          });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try { await axios.post("/api/auth/logout"); } catch { /* silent */ }
        set({ user: null, accessToken: null, refreshToken: null });
      },

      fetchMe: async () => {
        try {
          const token = get().accessToken;
          const { data } = await axios.get("/api/auth/me", {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          set({ user: data.data.user });
        } catch (err) {
          if (axios.isAxiosError(err) && err.response?.status === 401) {
            set({ user: null, accessToken: null, refreshToken: null });
          }
        }
      },

      toggleWishlist: async (propertyId) => {
        const token = get().accessToken;
        const { data } = await axios.post(
          "/api/wishlist",
          { propertyId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const user = get().user;
        if (!user) return;
        set({
          user: {
            ...user,
            wishlist: data.data.wishlisted
              ? [...user.wishlist, propertyId]
              : user.wishlist.filter((id) => id !== propertyId),
          },
        });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
