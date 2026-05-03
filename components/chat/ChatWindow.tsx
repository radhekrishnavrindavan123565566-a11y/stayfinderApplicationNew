"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Smile, X, Check, CheckCheck, ImageIcon, Loader2 } from "lucide-react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { useInView } from "react-intersection-observer";
import { useChatStore, ChatMessage } from "@/store/chatStore";
import { useAuthStore } from "@/store/authStore";
import { format, isToday, isYesterday } from "date-fns";
import { cn } from "@/utils/cn";
import ChatActionBar from "./ChatActionBar";
import OfferCard from "./OfferCard";
import VisitCard from "./VisitCard";
import axios from "axios";
import { useTranslations } from "next-intl";

interface Props {
  conversationId: string;
  otherUser: { _id: string; username: string; avatar?: string; isOnline?: boolean };
  propertyId?: string;
  propertyTitle?: string;
  propertyAddress?: string;
  onClose?: () => void;
}

function MessageTick({ status }: { status: ChatMessage["status"] }) {
  if (status === "seen") return <CheckCheck className="w-3.5 h-3.5 text-blue-300" />;
  if (status === "delivered") return <CheckCheck className="w-3.5 h-3.5 text-blue-200/60" />;
  return <Check className="w-3.5 h-3.5 text-blue-200/40" />;
}

function DateDivider({ date }: { date: string }) {
  const t = useTranslations("chat");
  const d = new Date(date);
  const label = isToday(d) ? t("today") : isYesterday(d) ? t("yesterday") : format(d, "MMM d, yyyy");
  return (
    <div className="flex items-center gap-2 my-3">
      <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
      <span className="text-xs text-gray-400 px-2">{label}</span>
      <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
    </div>
  );
}

const QUICK_EMOJIS = ["❤️", "👍", "😂", "😮", "😢", "🔥"];

function ReactionPicker({ messageId, conversationId, existingEmoji, onClose }: {
  messageId: string; conversationId: string; existingEmoji?: string; onClose: () => void;
}) {
  const { addReaction } = useChatStore();
  return (
    <motion.div
      initial={{ scale: 0.7, opacity: 0, y: 4 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.7, opacity: 0, y: 4 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="flex gap-1 bg-white dark:bg-gray-800 rounded-full shadow-xl border border-gray-200 dark:border-gray-700 px-2 py-1.5 z-50"
      onClick={(e) => e.stopPropagation()}
    >
      {QUICK_EMOJIS.map((e) => (
        <motion.button key={e} whileHover={{ scale: 1.3 }} whileTap={{ scale: 0.9 }}
          onClick={async () => { await addReaction(messageId, conversationId, e); onClose(); }}
          className={cn("text-lg leading-none", existingEmoji === e && "ring-2 ring-blue-400 rounded-full")}
        >{e}</motion.button>
      ))}
    </motion.div>
  );
}


function MessageBubble({ msg, isMine, conversationId, myUserId }: {
  msg: ChatMessage; isMine: boolean; conversationId: string; myUserId: string;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showPicker) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setShowPicker(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showPicker]);

  const myReaction = msg.reactions.find((r) => r.userId === myUserId)?.emoji;
  const reactionGroups = msg.reactions.reduce<Record<string, number>>((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {});

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      className={cn("flex group mb-1.5", isMine ? "justify-end" : "justify-start")}
    >
      <div className="relative max-w-[72%]">
        {/* Reaction trigger */}
        <div ref={pickerRef} className={cn("absolute -top-9 z-20 hidden group-hover:flex", isMine ? "right-0" : "left-0")}>
          <AnimatePresence>
            {showPicker ? (
              <ReactionPicker key="picker" messageId={msg._id} conversationId={conversationId}
                existingEmoji={myReaction} onClose={() => setShowPicker(false)} />
            ) : (
              <motion.button key="trigger" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                whileHover={{ scale: 1.1 }} onClick={() => setShowPicker(true)}
                className="bg-white dark:bg-gray-800 rounded-full p-1.5 shadow-md border border-gray-200 dark:border-gray-700">
                <Smile className="w-3.5 h-3.5 text-gray-500" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Bubble */}
        <div className={cn("px-3 py-2 rounded-2xl text-sm shadow-sm",
          isMine ? "bg-blue-600 text-white rounded-br-sm"
            : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm border border-gray-100 dark:border-gray-700"
        )}>
          {msg.type === "image" && msg.mediaUrl && (
            <img src={msg.mediaUrl} alt="media"
              className="rounded-xl max-w-full mb-1 max-h-52 object-cover cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(msg.mediaUrl, "_blank")} />
          )}
          {msg.content && <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>}
          <div className={cn("flex items-center gap-1 mt-0.5", isMine ? "justify-end" : "justify-start")}>
            <span className={cn("text-[10px]", isMine ? "text-blue-200" : "text-gray-400")}>
              {format(new Date(msg.createdAt), "HH:mm")}
            </span>
            {isMine && <MessageTick status={msg.status} />}
          </div>
        </div>

        {/* Reaction bubbles */}
        {Object.keys(reactionGroups).length > 0 && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className={cn("flex gap-0.5 mt-1 flex-wrap", isMine ? "justify-end" : "justify-start")}>
            {Object.entries(reactionGroups).map(([emoji, count]) => (
              <motion.button key={emoji} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                onClick={() => useChatStore.getState().addReaction(msg._id, conversationId, emoji)}
                className={cn("flex items-center gap-0.5 text-xs rounded-full px-1.5 py-0.5 shadow-sm border transition-colors",
                  myReaction === emoji
                    ? "bg-blue-100 dark:bg-blue-900/40 border-blue-300 dark:border-blue-700"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                )}>
                <span>{emoji}</span>
                {count > 1 && <span className="text-gray-500 dark:text-gray-400">{count}</span>}
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}


export default function ChatWindow({ conversationId, otherUser, propertyId, propertyTitle, propertyAddress, onClose }: Props) {
  const t = useTranslations("chat");
  const { messages, fetchMessages, fetchActions, actions, sendMessage, markSeen, typingUsers, isSending } = useChatStore();
  const { user, accessToken } = useAuthStore();
  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [isOnline, setIsOnline] = useState(otherUser.isOnline ?? false);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<{ file: File; url: string } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { ref: topRef } = useInView();

  const msgs = messages[conversationId] || [];
  const convActions = actions[conversationId] || [];
  const isTyping = typingUsers[conversationId];

  useEffect(() => {
    fetchMessages(conversationId);
    fetchActions(conversationId);
    markSeen(conversationId);
    if (accessToken) {
      axios.post("/api/chat/seen", { conversationId }, { headers: { Authorization: `Bearer ${accessToken}` } }).catch(() => {});
    }
  }, [conversationId]);

  // Poll online status every 30s
  useEffect(() => {
    const check = async () => {
      try {
        const { data } = await axios.get(`/api/chat/presence?ids=${otherUser._id}`, { headers: { Authorization: `Bearer ${accessToken}` } });
        setIsOnline(data.data.status[otherUser._id] ?? false);
      } catch { /* silent */ }
    };
    check();
    const t = setInterval(check, 30000);
    return () => clearInterval(t);
  }, [otherUser._id, accessToken]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs.length]);

  const sendTyping = useCallback((typing: boolean) => {
    if (!accessToken) return;
    axios.post("/api/chat/typing",
      { receiverId: otherUser._id, conversationId, isTyping: typing },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    ).catch(() => {});
  }, [otherUser._id, conversationId, accessToken]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text && !imagePreview) return;
    setInput("");
    setShowEmoji(false);
    sendTyping(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    if (imagePreview) {
      setIsUploading(true);
      try {
        const fd = new FormData();
        fd.append("file", imagePreview.file);
        const { data } = await axios.post("/api/chat/upload", fd, { headers: { Authorization: `Bearer ${accessToken}` } });
        await sendMessage({ receiverId: otherUser._id, content: text || "", type: "image", mediaUrl: data.data.url });
      } finally {
        setIsUploading(false);
        setImagePreview(null);
      }
    } else {
      await sendMessage({ receiverId: otherUser._id, content: text, type: "text" });
    }
  }, [input, imagePreview, otherUser._id, sendMessage, accessToken, sendTyping]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    sendTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => sendTyping(false), 2500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview({ file, url: URL.createObjectURL(file) });
    e.target.value = "";
  };

  // Group messages by date
  const grouped: { date: string; msgs: ChatMessage[] }[] = [];
  msgs.forEach((m) => {
    const d = format(new Date(m.createdAt), "yyyy-MM-dd");
    const last = grouped[grouped.length - 1];
    if (last && last.date === d) last.msgs.push(m);
    else grouped.push({ date: d, msgs: [m] });
  });

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 relative">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm flex-shrink-0">
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm overflow-hidden">
            {otherUser.avatar
              ? <img src={otherUser.avatar} alt={otherUser.username} className="w-full h-full object-cover" />
              : otherUser.username[0]?.toUpperCase()}
          </div>
          <motion.span animate={{ scale: isOnline ? 1 : 0.8, opacity: isOnline ? 1 : 0.5 }}
            className={cn("absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-800",
              isOnline ? "bg-green-500" : "bg-gray-400")} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{otherUser.username}</p>
          <AnimatePresence mode="wait">
            {isTyping
              ? <motion.p key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-blue-500 font-medium">{t("typing")}</motion.p>
              : <motion.p key="status" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cn("text-xs", isOnline ? "text-green-500" : "text-gray-400")}>{isOnline ? t("online") : t("offline")}</motion.p>
            }
          </AnimatePresence>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div ref={topRef} />
        {grouped.map((group) => (
          <div key={group.date}>
            <DateDivider date={group.msgs[0].createdAt} />
            {group.msgs.map((m) => (
              <MessageBubble key={m._id} msg={m}
                isMine={typeof m.senderId === "object" ? m.senderId._id === user?._id : m.senderId === user?._id}
                conversationId={conversationId} myUserId={user?._id ?? ""} />
            ))}
          </div>
        ))}

        {convActions.length > 0 && (
          <div className="space-y-2 my-2">
            {convActions.map((a) => {
              const isMine = a.initiatorId._id === user?._id;
              if (a.type === "send_offer") return (
                <div key={a._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                  <OfferCard action={a} isMine={isMine} onRespond={() => fetchActions(conversationId)} />
                </div>
              );
              if (a.type === "schedule_visit") return (
                <div key={a._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                  <VisitCard action={a} isMine={isMine} onRespond={() => fetchActions(conversationId)} />
                </div>
              );
              return null;
            })}
          </div>
        )}

        <AnimatePresence>
          {isTyping && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="flex items-center gap-2 px-1 py-1 mb-1">
              <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm border border-gray-100 dark:border-gray-700 flex gap-1 items-center">
                {[0, 1, 2].map((i) => (
                  <motion.div key={i} animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                    className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Image preview */}
      <AnimatePresence>
        {imagePreview && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="px-3 py-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="relative inline-block">
              <img src={imagePreview.url} alt="preview" className="h-20 w-20 object-cover rounded-xl border border-gray-200 dark:border-gray-700" />
              <button onClick={() => setImagePreview(null)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white shadow">
                <X className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emoji picker */}
      <AnimatePresence>
        {showEmoji && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-[72px] left-0 right-0 z-30 px-2 shadow-xl">
            <EmojiPicker onEmojiClick={(data: EmojiClickData) => setInput((p) => p + data.emoji)} width="100%" height={280} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input bar */}
      <div className="px-3 py-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-2 mb-1.5">
          <ChatActionBar conversationId={conversationId} receiverId={otherUser._id}
            propertyId={propertyId} propertyTitle={propertyTitle} propertyAddress={propertyAddress}
            onActionCreated={() => fetchActions(conversationId)} />
          {convActions.length > 0 && (
            <span className="text-xs text-zinc-400">{convActions.length} {t("pending_action", { count: convActions.length })}</span>
          )}
        </div>
        <div className="flex items-end gap-2 bg-gray-100 dark:bg-gray-700 rounded-2xl px-3 py-2">
          <button onClick={() => setShowEmoji((v) => !v)}
            className={cn("flex-shrink-0 transition-colors", showEmoji ? "text-yellow-500" : "text-gray-500 hover:text-yellow-500")}>
            <Smile className="w-5 h-5" />
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="text-gray-500 hover:text-blue-500 transition-colors flex-shrink-0">
            <ImageIcon className="w-5 h-5" />
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          <textarea value={input} onChange={handleInputChange} onKeyDown={handleKeyDown}
            placeholder={imagePreview ? t("add_caption") : t("type_message")} rows={1}
            className="flex-1 bg-transparent resize-none outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 max-h-24 py-0.5" />
          <motion.button whileTap={{ scale: 0.9 }} onClick={handleSend}
            disabled={(!input.trim() && !imagePreview) || isSending || isUploading}
            className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors">
            {isUploading || isSending ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
