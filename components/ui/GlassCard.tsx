"use client";

import { motion, type Variants } from "framer-motion";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  blur?: "sm" | "md" | "lg";
  onClick?: () => void;
  delay?: number;
}

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

export function GlassCard({
  children,
  className = "",
  hover = true,
  gradient = false,
  blur = "md",
  onClick,
  delay = 0,
}: GlassCardProps) {
  const blurMap = {
    sm: "backdrop-blur-sm",
    md: "backdrop-blur-md",
    lg: "backdrop-blur-lg",
  };

  const bgColor = gradient
    ? "bg-gradient-to-br from-white/10 to-white/5 dark:from-white/5 dark:to-white/2"
    : "bg-white/10 dark:bg-white/5";

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      transition={{ delay }}
      whileHover={hover ? { y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" } : undefined}
      onClick={onClick}
      className={`
        rounded-2xl border border-white/20 dark:border-white/10
        ${bgColor}
        ${blurMap[blur]}
        shadow-xl shadow-black/10 dark:shadow-black/50
        transition-all duration-300
        ${hover ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}

export function GlassPanel({
  children,
  title,
  className = "",
}: {
  children: ReactNode;
  title?: string;
  className?: string;
}) {
  return (
    <GlassCard className={`p-6 ${className}`}>
      {title && (
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">
          {title}
        </h3>
      )}
      {children}
    </GlassCard>
  );
}

export function GlassBadge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`
        inline-flex items-center px-3 py-1 rounded-full
        bg-white/20 dark:bg-white/10
        backdrop-blur-md
        border border-white/30 dark:border-white/20
        text-sm font-medium
        text-zinc-900 dark:text-white
        ${className}
      `}
    >
      {children}
    </span>
  );
}
