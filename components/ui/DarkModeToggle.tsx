"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useThemeStore } from "@/store/themeStore";

export default function DarkModeToggle({ className = "" }: { className?: string }) {
  const { isDark, toggle } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Render a placeholder with same dimensions to avoid layout shift
  if (!mounted) {
    return <div className={`w-10 h-10 rounded-full bg-zinc-100 ${className}`} />;
  }

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={toggle}
      aria-label="Toggle dark mode"
      suppressHydrationWarning
      className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
        isDark
          ? "bg-zinc-800 text-yellow-400 hover:bg-zinc-700"
          : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
      } ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isDark ? "moon" : "sun"}
          initial={{ rotate: -30, opacity: 0, scale: 0.7 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 30, opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.15 }}
        >
          {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
}
