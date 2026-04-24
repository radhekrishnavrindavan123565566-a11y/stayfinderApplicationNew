import { create } from "zustand";
import axios from "axios";
import { useAuthStore } from "./authStore";

export interface AppNotification {
  _id: string;
  type: "booking" | "message" | "payment" | "review" | "system" | "boost";
  title: string;
  body: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  isOpen: boolean;

  fetchNotifications: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  addNotification: (n: AppNotification) => void;
  removeByConversation: (conversationId: string) => void;
  togglePanel: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isOpen: false,

  togglePanel: () => set((s) => ({ isOpen: !s.isOpen })),

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().accessToken;
      const { data } = await axios.get("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const notifs: AppNotification[] = data.data.notifications;
      set({ notifications: notifs, unreadCount: notifs.filter((n) => !n.read).length });
    } catch {
      // silent
    } finally {
      set({ isLoading: false });
    }
  },

  markRead: async (id) => {
    const token = useAuthStore.getState().accessToken;
    await axios.patch(`/api/notifications/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
    set((s) => ({
      notifications: s.notifications.map((n) => (n._id === id ? { ...n, read: true } : n)),
      unreadCount: Math.max(0, s.unreadCount - 1),
    }));
  },

  markAllRead: async () => {
    const token = useAuthStore.getState().accessToken;
    await axios.patch("/api/notifications", {}, { headers: { Authorization: `Bearer ${token}` } });
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  addNotification: (n) => {
    set((s) => ({
      notifications: [n, ...s.notifications],
      unreadCount: s.unreadCount + 1,
    }));
  },

  removeByConversation: (conversationId) => {
    const link = `/chat?conversation=${conversationId}`;
    set((s) => {
      const removed = s.notifications.filter((n) => n.link === link && !n.read);
      const remaining = s.notifications.filter((n) => n.link !== link);
      return {
        notifications: remaining,
        unreadCount: Math.max(0, s.unreadCount - removed.length),
      };
    });
  },
}));
