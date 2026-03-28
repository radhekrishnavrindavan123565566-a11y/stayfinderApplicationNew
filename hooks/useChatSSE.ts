"use client";
import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import axios from "axios";

export function useChatSSE() {
  const { user, accessToken } = useAuthStore();
  const { addIncomingMessage, updateMessageStatus, updateMessageReactions, setTyping } = useChatStore();
  const esRef = useRef<EventSource | null>(null);
  const hbRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user || !accessToken) {
      esRef.current?.close();
      esRef.current = null;
      if (hbRef.current) clearInterval(hbRef.current);
      return;
    }

    let active = true;

    function connect() {
      if (!active || !accessToken) return;

      const es = new EventSource(`/api/chat/sse?token=${encodeURIComponent(accessToken)}`);
      esRef.current = es;

      es.addEventListener("message:new", (e) => {
        const { message } = JSON.parse(e.data);
        addIncomingMessage(message);
        // Auto-mark seen if this conversation is currently open
        const state = useChatStore.getState();
        if (state.activeConversationId === message.conversationId) {
          axios.post("/api/chat/seen", { conversationId: message.conversationId }, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }).catch(() => {});
        }
      });

      es.addEventListener("message:status", (e) => {
        const { messageId, status, conversationId } = JSON.parse(e.data);
        if (conversationId) {
          // Fast path — we know the conversation
          updateMessageStatus(messageId, conversationId, status);
        } else {
          // Fallback — scan all conversations
          const allMessages = useChatStore.getState().messages;
          for (const [convId, msgs] of Object.entries(allMessages)) {
            if (msgs.some((m) => m._id === messageId)) {
              updateMessageStatus(messageId, convId, status);
              break;
            }
          }
        }
      });

      es.addEventListener("message:seen", (e) => {
        const { conversationId } = JSON.parse(e.data);
        const msgs = useChatStore.getState().messages[conversationId] || [];
        msgs.forEach((m) => {
          if (m.status !== "seen") updateMessageStatus(m._id, conversationId, "seen");
        });
      });

      es.addEventListener("message:reaction", (e) => {
        const { messageId, conversationId, reactions } = JSON.parse(e.data);
        updateMessageReactions(messageId, conversationId, reactions);
      });

      es.addEventListener("typing", (e) => {
        const { conversationId, isTyping } = JSON.parse(e.data);
        setTyping(conversationId, isTyping);
        // Auto-clear after 4s in case stop event is missed
        if (isTyping) setTimeout(() => setTyping(conversationId, false), 4000);
      });

      es.onerror = () => {
        es.close();
        esRef.current = null;
        // Reconnect after 3s
        if (active) {
          reconnectRef.current = setTimeout(connect, 3000);
        }
      };
    }

    connect();

    // Heartbeat to keep online status alive
    const sendHeartbeat = () => {
      axios.post("/api/chat/presence", {}, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }).catch(() => {});
    };
    sendHeartbeat();
    hbRef.current = setInterval(sendHeartbeat, 30000);

    return () => {
      active = false;
      esRef.current?.close();
      esRef.current = null;
      if (hbRef.current) clearInterval(hbRef.current);
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
    };
  }, [user?._id, accessToken]);
}
