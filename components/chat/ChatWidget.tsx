"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, ChevronLeft } from "lucide-react";
import { useChatStore, Conversation } from "@/store/chatStore";
import { useAuthStore } from "@/store/authStore";
import ChatWindow from "./ChatWindow";
import { format } from "date-fns";
import { useTranslations } from "next-intl";

function ConversationItem({ convo, onClick }: { convo: Conversation; onClick: () => void }) {
  const t = useTranslations("chat");
  const initial = convo.otherUser?.username?.[0]?.toUpperCase() ?? "?";
  return (
    <motion.button
      whileHover={{ backgroundColor: "rgba(244,63,94,0.05)" }}
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors border-b border-zinc-100 dark:border-zinc-800 last:border-0 min-h-[56px]"
    >
      <div className="relative flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-white font-semibold text-sm overflow-hidden">
          {convo.otherUser?.avatar
            ? <img src={convo.otherUser.avatar} alt={convo.otherUser.username} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            : initial}
        </div>
        {convo.otherUser?.isOnline && (
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-zinc-900" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <p className="font-medium text-sm text-zinc-900 dark:text-white truncate">{convo.otherUser?.username ?? "User"}</p>
          {convo.lastMessage?.createdAt && (
            <span className="text-[10px] text-zinc-400 flex-shrink-0">
              {format(new Date(convo.lastMessage.createdAt), "HH:mm")}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-1 mt-0.5">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
            {convo.lastMessage?.content || t("start_conversation")}
          </p>
          {(convo.unreadCount ?? 0) > 0 && (
            <span className="ml-1 flex-shrink-0 min-w-[18px] h-[18px] bg-rose-500 rounded-full text-[10px] text-white flex items-center justify-center px-1 font-bold">
              {convo.unreadCount > 9 ? "9+" : convo.unreadCount}
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}

export default function ChatWidget() {
  const t = useTranslations("chat");
  const { user } = useAuthStore();
  const { isOpen, toggleChat, conversations, fetchConversations, activeConversationId, setActiveConversation, unreadTotal } = useChatStore();
  const [view, setView] = useState<"list" | "chat">("list");

  useEffect(() => {
    if (user) {
      fetchConversations().catch(() => {/* silent */});
    }
  }, [user, fetchConversations]);

  useEffect(() => {
    if (activeConversationId) setView("chat");
  }, [activeConversationId]);

  if (!user) return null;

  const activeConvo = conversations.find((c) => c.conversationId === activeConversationId);

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className={[
              "bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl",
              "border border-zinc-200 dark:border-zinc-700 overflow-hidden flex flex-col",
              // Full-width on very small screens, fixed on larger
              "w-[calc(100vw-2rem)] sm:w-80",
              "h-[min(480px,calc(100vh-120px))]",
            ].join(" ")}
          >
            {view === "list" ? (
              <>
                {/* Header */}
                <div className="px-4 py-3 bg-gradient-to-r from-rose-500 to-rose-600 text-white flex items-center justify-between flex-shrink-0">
                  <div>
                    <h3 className="font-semibold text-sm">{t("messages")}</h3>
                    <p className="text-[10px] text-rose-100">{conversations.length} {t("conversation", { count: conversations.length })}</p>
                  </div>
                  <button
                    onClick={toggleChat}
                    className="p-2 rounded-full hover:bg-white/20 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                    aria-label={t("close_chat")}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {/* List */}
                <div className="flex-1 overflow-y-auto">
                  {conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-3 py-8 px-4">
                      <MessageCircle className="w-10 h-10 opacity-20" />
                      <p className="text-sm text-center">{t("no_conversations")}</p>
                      <p className="text-xs text-center text-zinc-400">{t("no_conversations_hint")}</p>
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
                  className="absolute top-3 left-3 z-10 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                  aria-label={t("back_to_conversations")}
                >
                  <ChevronLeft className="w-4 h-4 text-white" />
                </button>
                {activeConversationId && (
                  <ChatWindow
                    conversationId={activeConversationId}
                    otherUser={activeConvo?.otherUser ?? {
                      _id: activeConversationId.split("_").find(id => id !== user?._id) ?? "",
                      username: "User",
                    }}
                    onClose={() => { setView("list"); setActiveConversation(null); }}
                  />
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={toggleChat}
        className="relative w-14 h-14 bg-gradient-to-br from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 rounded-full shadow-lg shadow-rose-500/30 flex items-center justify-center transition-colors"
        aria-label={isOpen ? t("close_messages") : t("open_messages")}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageCircle className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
        {unreadTotal > 0 && !isOpen && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-amber-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold px-1"
          >
            {unreadTotal > 9 ? "9+" : unreadTotal}
          </motion.span>
        )}
      </motion.button>
    </div>
  );
}
