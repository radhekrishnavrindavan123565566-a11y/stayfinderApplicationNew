"use client";
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, CheckCheck, X } from "lucide-react";
import { useNotificationStore, AppNotification } from "@/store/notificationStore";
import { useAuthStore } from "@/store/authStore";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { cn } from "@/utils/cn";

const typeColors: Record<AppNotification["type"], string> = {
  booking: "bg-blue-100 text-blue-600",
  message: "bg-green-100 text-green-600",
  payment: "bg-yellow-100 text-yellow-600",
  review: "bg-purple-100 text-purple-600",
  system: "bg-gray-100 text-gray-600",
  boost: "bg-orange-100 text-orange-600",
};

const typeIcons: Record<AppNotification["type"], string> = {
  booking: "📅",
  message: "💬",
  payment: "💰",
  review: "⭐",
  system: "🔔",
  boost: "🚀",
};

export default function NotificationBell() {
  const { user } = useAuthStore();
  const { notifications, unreadCount, isOpen, togglePanel, fetchNotifications, markRead, markAllRead } = useNotificationStore();
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        if (isOpen) togglePanel();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  if (!user) return null;

  const handleClick = async (n: AppNotification) => {
    if (!n.read) await markRead(n._id);
    if (n.link) router.push(n.link);
    togglePanel();
  };

  return (
    <div className="relative" ref={panelRef}>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={togglePanel}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <CheckCheck className="w-3 h-3" /> Mark all read
                  </button>
                )}
                <button onClick={togglePanel} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                  <X className="w-3.5 h-3.5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
                  <Bell className="w-8 h-8 opacity-30" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <motion.button
                    key={n._id}
                    whileHover={{ backgroundColor: "rgba(59,130,246,0.04)" }}
                    onClick={() => handleClick(n)}
                    className={cn(
                      "w-full flex items-start gap-3 px-4 py-3 text-left border-b border-gray-50 dark:border-gray-800 last:border-0 transition-colors",
                      !n.read && "bg-blue-50/50 dark:bg-blue-900/10"
                    )}
                  >
                    <span className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0", typeColors[n.type])}>
                      {typeIcons[n.type]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{n.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {!n.read && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />}
                  </motion.button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
