"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, ChevronLeft } from "lucide-react";
import { useChatStore, Conversation } from "@/store/chatStore";
import { useAuthStore } from "@/store/authStore";
import ChatWindow from "./ChatWindow";
import { format } from "date-fns";

function ConversationItem({ convo, onClick }: { convo: Conversation; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ backgroundColor: "rgba(59,130,246,0.05)" }}
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
    >
      <div className="relative flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm overflow-hidden">
          {convo.otherUser.avatar ? (
            <img src={convo.otherUser.avatar} alt={convo.otherUser.username} className="w-full h-full object-cover" />
          ) : (
            convo.otherUser.username[0]?.toUpperCase()
          )}
        </div>
        {convo.otherUser.isOnline && (
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{convo.otherUser.username}</p>
          {convo.lastMessage && (
            <span className="text-[10px] text-gray-400 flex-shrink-0 ml-1">
              {format(new Date(convo.lastMessage.createdAt), "HH:mm")}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500 truncate">
            {convo.lastMessage?.content || "Start a conversation"}
          </p>
          {convo.unreadCount > 0 && (
            <span className="ml-1 flex-shrink-0 w-4 h-4 bg-blue-600 rounded-full text-[10px] text-white flex items-center justify-center">
              {convo.unreadCount > 9 ? "9+" : convo.unreadCount}
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}

export default function ChatWidget() {
  const { user } = useAuthStore();
  const { isOpen, toggleChat, conversations, fetchConversations, activeConversationId, setActiveConversation, unreadTotal } = useChatStore();
  const [view, setView] = useState<"list" | "chat">("list");

  useEffect(() => {
    if (user) fetchConversations();
  }, [user]);

  useEffect(() => {
    if (activeConversationId) setView("chat");
  }, [activeConversationId]);

  if (!user) return null;

  const activeConvo = conversations.find((c) => c.conversationId === activeConversationId);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-80 h-[480px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col"
          >
            {view === "list" ? (
              <>
                <div className="px-4 py-3 bg-blue-600 text-white flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Messages</h3>
                  <button onClick={toggleChat} className="p-1 rounded-full hover:bg-blue-700 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                      <MessageCircle className="w-10 h-10 opacity-30" />
                      <p className="text-sm">No conversations yet</p>
                    </div>
                  ) : (
                    conversations.map((c) => (
                      <ConversationItem
                        key={c.conversationId}
                        convo={c}
                        onClick={() => { setActiveConversation(c.conversationId); setView("chat"); }}
                      />
                    ))
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col h-full relative">
                <button
                  onClick={() => { setView("list"); setActiveConversation(null); }}
                  className="absolute top-3 left-3 z-10 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-white" />
                </button>
                {activeConversationId && (
                  <ChatWindow
                    conversationId={activeConversationId}
                    otherUser={activeConvo?.otherUser ?? { _id: activeConversationId.split("_").find(id => id !== user?._id) ?? "", username: "User" }}
                    onClose={() => { setView("list"); setActiveConversation(null); }}
                  />
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleChat}
        className="relative w-14 h-14 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg flex items-center justify-center transition-colors"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
        {unreadTotal > 0 && !isOpen && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold"
          >
            {unreadTotal > 9 ? "9+" : unreadTotal}
          </motion.span>
        )}
      </motion.button>
    </div>
  );
}
