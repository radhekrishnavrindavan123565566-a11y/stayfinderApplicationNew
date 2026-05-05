"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Menu, X } from "lucide-react";
import { useChatStore, Conversation } from "@/store/chatStore";
import { useAuthStore } from "@/store/authStore";
import ChatWindow from "@/components/chat/ChatWindow";
import { useRouter } from "next/navigation";
import { format, isToday, isYesterday } from "date-fns";
import { cn } from "@/utils/cn";

function ConversationItem({
  convo,
  isActive,
  onClick,
}: {
  convo: Conversation;
  isActive: boolean;
  onClick: () => void;
}) {
  const lastMsgTime = convo.lastMessage
    ? isToday(new Date(convo.lastMessage.createdAt))
      ? format(new Date(convo.lastMessage.createdAt), "HH:mm")
      : isYesterday(new Date(convo.lastMessage.createdAt))
      ? "Yesterday"
      : format(new Date(convo.lastMessage.createdAt), "MMM d")
    : "";

  return (
    <motion.button
      whileHover={{ x: 3 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all border-b border-zinc-100 dark:border-zinc-800",
        isActive
          ? "bg-rose-50 dark:bg-rose-950/20 border-l-2 border-l-rose-500"
          : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
      )}
    >
      <div className="relative flex-shrink-0">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-white font-semibold overflow-hidden">
          {convo.otherUser.avatar ? (
            <img src={convo.otherUser.avatar} alt={convo.otherUser.username} className="w-full h-full object-cover" />
          ) : (
            convo.otherUser.username[0]?.toUpperCase()
          )}
        </div>
        {convo.otherUser.isOnline && (
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-zinc-900"
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className={cn(
            "font-medium text-sm truncate",
            isActive ? "text-rose-600 dark:text-rose-400" : "text-zinc-900 dark:text-white"
          )}>
            {convo.otherUser.username}
          </p>
          <span className="text-[10px] text-zinc-400 flex-shrink-0 ml-2">{lastMsgTime}</span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
            {convo.lastMessage?.content || "Start a conversation"}
          </p>
          {convo.unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="ml-2 flex-shrink-0 min-w-[18px] h-[18px] bg-rose-500 rounded-full text-[10px] text-white flex items-center justify-center px-1 font-medium"
            >
              {convo.unreadCount > 9 ? "9+" : convo.unreadCount}
            </motion.span>
          )}
        </div>
      </div>
    </motion.button>
  );
}

export default function ChatPage() {
  const { user } = useAuthStore();
  const { conversations, fetchConversations, activeConversationId, setActiveConversation, isLoading } = useChatStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!user) { router.replace("/auth/login"); return; }
    fetchConversations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, mounted]);

  // Auto-open conversation from URL param (?conversation=xxx_yyy)
  useEffect(() => {
    if (!mounted) return;
    const params = new URLSearchParams(window.location.search);
    const convId = params.get("conversation");
    if (convId) setActiveConversation(convId);
  }, [mounted]);

  const activeConvo = conversations.find((c) => c.conversationId === activeConversationId);

  // Debug log
  useEffect(() => {
    // removed debug logs
  }, [activeConversationId, activeConvo]);

  if (!mounted) return (
    <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-white dark:bg-zinc-900">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full"
      />
    </div>
  );

  return (
    <div className="h-[calc(100vh-64px)] flex bg-white dark:bg-zinc-900 overflow-hidden">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ x: sidebarOpen ? 0 : undefined }}
        className={cn(
          "flex-shrink-0 border-r border-zinc-200 dark:border-zinc-700 flex flex-col bg-white dark:bg-zinc-900",
          "fixed md:relative inset-y-0 left-0 z-50 md:z-auto",
          "w-full sm:w-80 md:w-72 lg:w-80",
          "transition-transform duration-300 ease-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
        style={{ top: 64, willChange: "transform" }}
      >
        <div className="px-4 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-zinc-900 dark:text-white">Messages</h1>
            <p className="text-xs text-zinc-500 mt-0.5">{conversations.length} conversations</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4 text-zinc-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-1 p-2">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-3 p-3"
                >
                  <div className="w-11 h-11 rounded-full skeleton-shimmer flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 skeleton-shimmer rounded w-3/4" />
                    <div className="h-2.5 skeleton-shimmer rounded w-1/2" />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full text-zinc-400 gap-3 py-16 px-6"
            >
              <MessageCircle className="w-12 h-12 opacity-20" />
              <p className="text-sm font-medium">No conversations yet</p>
              <p className="text-xs text-center">Start chatting by visiting a property and messaging the owner</p>
            </motion.div>
          ) : (
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
            >
              {conversations.map((c, i) => (
                <motion.div
                  key={c.conversationId}
                  variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }}
                >
                  <ConversationItem
                    convo={c}
                    isActive={c.conversationId === activeConversationId}
                    onClick={() => {
                      console.log("Conversation clicked:", c.conversationId);
                      setActiveConversation(c.conversationId);
                      setSidebarOpen(false);
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors touch-target"
            aria-label="Open conversations"
          >
            <Menu className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </motion.button>
          <span className="font-semibold text-zinc-900 dark:text-white text-sm truncate flex-1">
            {activeConvo ? activeConvo.otherUser.username : "Messages"}
          </span>
        </div>

        <AnimatePresence mode="wait">
          {activeConversationId && activeConvo ? (
            <motion.div
              key={activeConversationId}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="flex-1 flex flex-col h-full overflow-hidden"
            >
              <ChatWindow conversationId={activeConversationId} otherUser={activeConvo.otherUser} />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-zinc-400 gap-4 px-4"
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center"
              >
                <MessageCircle className="w-10 h-10 opacity-30" />
              </motion.div>
              <div className="text-center">
                <p className="font-medium text-zinc-600 dark:text-zinc-400">Select a conversation</p>
                <p className="text-sm mt-1 text-zinc-400 dark:text-zinc-500">
                  Choose from your existing conversations
                </p>
              </div>
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden text-sm text-rose-500 font-medium hover:underline"
              >
                View conversations
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
