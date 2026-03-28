import { create } from "zustand";
import axios from "axios";
import { useAuthStore } from "./authStore";

export interface ChatMessage {
  _id: string;
  conversationId: string;
  senderId: { _id: string; username: string; avatar?: string } | string;
  receiverId: string;
  content: string;
  type: "text" | "image" | "video" | "file" | "emoji";
  status: "sent" | "delivered" | "seen";
  mediaUrl?: string;
  reactions: { userId: string; emoji: string }[];
  createdAt: string;
}

export interface ChatAction {
  _id: string;
  conversationId: string;
  type: "schedule_visit" | "send_offer" | "generate_agreement" | "confirm_booking";
  status: "pending" | "accepted" | "rejected" | "expired";
  payload?: Record<string, unknown>;
  initiatorId: { _id: string; username: string };
  receiverId: { _id: string; username: string };
  expiresAt: string;
  createdAt: string;
}

export interface Conversation {
  conversationId: string;
  otherUser: { _id: string; username: string; avatar?: string; isOnline?: boolean; lastSeen?: string };
  lastMessage?: ChatMessage;
  unreadCount: number;
  propertyId?: string;
  propertyTitle?: string;
  propertyAddress?: string;
}

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Record<string, ChatMessage[]>;
  actions: Record<string, ChatAction[]>;
  typingUsers: Record<string, boolean>;
  isLoading: boolean;
  isSending: boolean;
  isOpen: boolean;
  unreadTotal: number;

  setActiveConversation: (id: string | null) => void;
  toggleChat: () => void;
  openChat: (conversationId: string) => void;
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  fetchActions: (conversationId: string) => Promise<void>;
  sendMessage: (payload: {
    receiverId: string;
    content: string;
    type?: ChatMessage["type"];
    mediaUrl?: string;
    propertyId?: string;
  }) => Promise<void>;
  markSeen: (conversationId: string) => void;
  setTyping: (conversationId: string, isTyping: boolean) => void;
  addReaction: (messageId: string, conversationId: string, emoji: string) => Promise<void>;
  updateMessageReactions: (messageId: string, conversationId: string, reactions: { userId: string; emoji: string }[]) => void;
  addIncomingMessage: (message: ChatMessage) => void;
  updateMessageStatus: (messageId: string, conversationId: string, status: ChatMessage["status"]) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: {},
  actions: {},
  typingUsers: {},
  isLoading: false,
  isSending: false,
  isOpen: false,
  unreadTotal: 0,

  setActiveConversation: (id) => set({ activeConversationId: id }),

  toggleChat: () => set((s) => ({ isOpen: !s.isOpen })),

  openChat: (conversationId) => {
    set({ isOpen: true, activeConversationId: conversationId });
    // Ensure conversations are loaded so the widget can find the active one
    get().fetchConversations();
    // Also pre-fetch messages for this conversation
    get().fetchMessages(conversationId);
  },

  fetchConversations: async () => {
    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().accessToken;
      const { data } = await axios.get("/api/chat/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const convos: Conversation[] = data.data.conversations;
      const unreadTotal = convos.reduce((sum, c) => sum + c.unreadCount, 0);
      set({ conversations: convos, unreadTotal });
    } catch {
      // silent fail
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMessages: async (conversationId) => {
    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().accessToken;
      const { data } = await axios.get(`/api/chat/messages?conversationId=${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set((s) => ({
        messages: { ...s.messages, [conversationId]: data.data.messages },
      }));
    } catch {
      // silent fail
    } finally {
      set({ isLoading: false });
    }
  },

  fetchActions: async (conversationId) => {
    try {
      const token = useAuthStore.getState().accessToken;
      const { data } = await axios.get(`/api/chat/actions?conversationId=${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set((s) => ({
        actions: { ...s.actions, [conversationId]: data.data.actions },
      }));
    } catch {
      // silent fail
    }
  },

  sendMessage: async ({ receiverId, content, type = "text", mediaUrl, propertyId }) => {
    set({ isSending: true });
    try {
      const token = useAuthStore.getState().accessToken;
      const { data } = await axios.post(
        "/api/chat/send",
        { receiverId, content, type, mediaUrl, propertyId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const msg: ChatMessage = data.data.message;
      set((s) => ({
        messages: {
          ...s.messages,
          [msg.conversationId]: [...(s.messages[msg.conversationId] || []), msg],
        },
      }));
    } finally {
      set({ isSending: false });
    }
  },

  markSeen: (conversationId) => {
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.conversationId === conversationId ? { ...c, unreadCount: 0 } : c
      ),
      messages: {
        ...s.messages,
        [conversationId]: (s.messages[conversationId] || []).map((m) => ({ ...m, status: "seen" as const })),
      },
    }));
  },

  setTyping: (conversationId, isTyping) => {
    set((s) => ({ typingUsers: { ...s.typingUsers, [conversationId]: isTyping } }));
  },

  addReaction: async (messageId, conversationId, emoji) => {
    const token = useAuthStore.getState().accessToken;
    const userId = useAuthStore.getState().user?._id;

    // Optimistic update
    set((s) => ({
      messages: {
        ...s.messages,
        [conversationId]: (s.messages[conversationId] || []).map((m) => {
          if (m._id !== messageId) return m;
          const existing = m.reactions.findIndex((r) => r.userId === userId);
          let reactions;
          if (existing >= 0) {
            if (m.reactions[existing].emoji === emoji) {
              // toggle off
              reactions = m.reactions.filter((_, i) => i !== existing);
            } else {
              reactions = m.reactions.map((r, i) => i === existing ? { ...r, emoji } : r);
            }
          } else {
            reactions = [...m.reactions, { userId: userId!, emoji }];
          }
          return { ...m, reactions };
        }),
      },
    }));

    try {
      const { data } = await axios.post(
        "/api/chat/react",
        { messageId, emoji },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Sync with server's authoritative reactions
      set((s) => ({
        messages: {
          ...s.messages,
          [conversationId]: (s.messages[conversationId] || []).map((m) =>
            m._id === messageId ? { ...m, reactions: data.data.reactions } : m
          ),
        },
      }));
    } catch {
      // Revert optimistic update on failure by re-fetching
    }
  },

  updateMessageReactions: (messageId, conversationId, reactions) => {
    set((s) => ({
      messages: {
        ...s.messages,
        [conversationId]: (s.messages[conversationId] || []).map((m) =>
          m._id === messageId ? { ...m, reactions } : m
        ),
      },
    }));
  },

  addIncomingMessage: (message) => {
    set((s) => {
      const convId = message.conversationId;
      const isActive = s.activeConversationId === convId && s.isOpen;
      return {
        messages: {
          ...s.messages,
          [convId]: [...(s.messages[convId] || []), message],
        },
        unreadTotal: isActive ? s.unreadTotal : s.unreadTotal + 1,
        conversations: s.conversations.map((c) =>
          c.conversationId === convId
            ? { ...c, lastMessage: message, unreadCount: isActive ? 0 : c.unreadCount + 1 }
            : c
        ),
      };
    });
  },

  updateMessageStatus: (messageId, conversationId, status) => {
    set((s) => ({
      messages: {
        ...s.messages,
        [conversationId]: (s.messages[conversationId] || []).map((m) =>
          m._id === messageId ? { ...m, status } : m
        ),
      },
    }));
  },
}));
