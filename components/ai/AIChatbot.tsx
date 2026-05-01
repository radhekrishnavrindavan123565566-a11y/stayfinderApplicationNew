"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, Loader2, Bot, User, Home } from "lucide-react";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";

interface Message {
  role: "user" | "assistant";
  content: string;
  properties?: PropertyResult[];
}

interface PropertyResult {
  _id: string;
  title: string;
  price: number;
  location: { city: string; country: string };
  propertyType: string;
  bedrooms: number;
  images: string[];
  averageRating: number;
}

const SUGGESTIONS = [
  "2BHK flat in Lucknow under ₹10,000",
  "PG near Allahabad University",
  "Furnished apartment in Kanpur",
  "Cheapest rooms in Varanasi",
];

export default function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm Nestora's AI assistant 🏠 I can help you find the perfect property. What are you looking for?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const send = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");

    const userMsg: Message = { role: "user", content: msg };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
      const { data } = await axios.post("/api/ai/chat", { message: msg, history });
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.data.reply,
        properties: data.data.properties?.slice(0, 3),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I'm having trouble right now. Please try again or browse properties directly.",
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 sm:bottom-28 sm:right-6 z-40 w-[52px] h-[52px] bg-gradient-to-br from-violet-600 to-indigo-600 rounded-full shadow-xl shadow-violet-500/30 flex items-center justify-center"
        aria-label="Open AI Assistant"
      >
        <Sparkles className="w-5 h-5 text-white" />
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop on mobile */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40 sm:hidden" onClick={() => setOpen(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className={[
                "fixed z-50 flex flex-col bg-white dark:bg-zinc-900",
                "border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-2xl overflow-hidden",
                "bottom-4 right-4 sm:bottom-28 sm:right-6",
                "w-[calc(100vw-2rem)] sm:w-96",
                "h-[min(560px,calc(100vh-100px))]",
              ].join(" ")}
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">Nestora AI</p>
                  <p className="text-white/70 text-[10px]">Property search assistant</p>
                </div>
                <button onClick={() => setOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/20 transition-colors">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "assistant" && (
                      <div className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5 text-violet-600" />
                      </div>
                    )}
                    <div className="max-w-[80%] space-y-2">
                      <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-violet-600 text-white rounded-br-sm"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-bl-sm"
                      }`}>
                        {msg.content}
                      </div>
                      {/* Property cards */}
                      {msg.properties && msg.properties.length > 0 && (
                        <div className="space-y-2">
                          {msg.properties.map((p) => (
                            <Link key={p._id} href={`/properties/${p._id}`} onClick={() => setOpen(false)}>
                              <motion.div whileHover={{ scale: 1.02 }}
                                className="flex gap-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-2 hover:border-violet-400 transition-colors cursor-pointer">
                                <div className="relative w-14 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                  {p.images?.[0]
                                    ? <Image src={p.images[0]} alt={p.title} fill sizes="56px" className="object-cover" />
                                    : <div className="w-full h-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center"><Home className="w-4 h-4 text-zinc-400" /></div>
                                  }
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate">{p.title}</p>
                                  <p className="text-[10px] text-zinc-500">{p.location.city} · {p.bedrooms} bed</p>
                                  <p className="text-xs font-bold text-violet-600">₹{p.price.toLocaleString("en-IN")}/mo</p>
                                </div>
                              </motion.div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                    {msg.role === "user" && (
                      <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <User className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="flex gap-2 justify-start">
                    <div className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3.5 h-3.5 text-violet-600" />
                    </div>
                    <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl rounded-bl-sm px-3 py-2 flex gap-1 items-center">
                      {[0,1,2].map(i => (
                        <motion.div key={i} animate={{ y: [0,-4,0] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                          className="w-1.5 h-1.5 bg-violet-500 rounded-full" />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Suggestions (only on first message) */}
              {messages.length === 1 && (
                <div className="px-4 pb-2 flex flex-wrap gap-1.5 flex-shrink-0">
                  {SUGGESTIONS.map(s => (
                    <button key={s} onClick={() => send(s)}
                      className="text-[11px] bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 px-2.5 py-1 rounded-full hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="px-3 py-2.5 border-t border-zinc-100 dark:border-zinc-800 flex gap-2 flex-shrink-0">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
                  placeholder="Ask about properties..."
                  className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 outline-none focus:ring-2 focus:ring-violet-400"
                />
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => send()}
                  disabled={!input.trim() || loading}
                  className="w-9 h-9 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 rounded-xl flex items-center justify-center transition-colors flex-shrink-0">
                  {loading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
