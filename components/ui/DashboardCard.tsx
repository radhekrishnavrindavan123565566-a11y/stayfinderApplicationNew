"use client";

import { motion, type Variants } from "framer-motion";
import { ReactNode } from "react";
import { GlassCard } from "./GlassCard";

interface DashboardCardProps {
  title: string;
  value?: string | number;
  label?: string;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  children?: ReactNode;
  variant?: "primary" | "success" | "warning" | "danger";
  onClick?: () => void;
  className?: string;
  delay?: number;
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const getTrendColor = (trend?: string) => {
  switch (trend) {
    case "up":
      return "text-green-500";
    case "down":
      return "text-red-500";
    default:
      return "text-zinc-500";
  }
};

const getTrendIcon = (trend?: string) => {
  switch (trend) {
    case "up":
      return "↑";
    case "down":
      return "↓";
    default:
      return "→";
  }
};

const getGradient = (variant: string) => {
  switch (variant) {
    case "success":
      return "from-green-500/20 to-emerald-500/20 dark:from-green-900/30 dark:to-emerald-900/30";
    case "warning":
      return "from-yellow-500/20 to-orange-500/20 dark:from-yellow-900/30 dark:to-orange-900/30";
    case "danger":
      return "from-red-500/20 to-pink-500/20 dark:from-red-900/30 dark:to-pink-900/30";
    default:
      return "from-blue-500/20 to-cyan-500/20 dark:from-blue-900/30 dark:to-cyan-900/30";
  }
};

export function DashboardCard({
  title,
  value,
  label,
  icon,
  trend,
  trendValue,
  children,
  variant = "primary",
  onClick,
  className = "",
  delay = 0,
}: DashboardCardProps) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={cardVariants}
      transition={{ delay }}
    >
      <GlassCard
        hover={!!onClick}
        onClick={onClick}
        className={`p-6 ${className}`}
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                {title}
              </p>
            </div>
            {icon && (
              <div
                className={`p-2 rounded-lg bg-gradient-to-br ${getGradient(
                  variant
                )}`}
              >
                {icon}
              </div>
            )}
          </div>

          {/* Value Section */}
          {value !== undefined && (
            <div className="space-y-1">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: delay + 0.2 }}
                className="text-3xl font-bold text-zinc-900 dark:text-white"
              >
                {value}
              </motion.div>
              {label && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {label}
                </p>
              )}
            </div>
          )}

          {/* Children */}
          {children && <div>{children}</div>}

          {/* Trend */}
          {trend && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 0.3 }}
              className={`flex items-center gap-1 text-sm font-medium ${getTrendColor(
                trend
              )}`}
            >
              <span>{getTrendIcon(trend)}</span>
              <span>{trendValue || "0%"}</span>
            </motion.div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}

export function DashboardGrid({
  children,
  columns = 4,
}: {
  children: ReactNode;
  columns?: number;
}) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  };

  return (
    <div
      className={`grid gap-6 ${gridCols[columns as keyof typeof gridCols]} md:grid-cols-2 sm:grid-cols-1`}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  unit,
  icon,
  color = "blue",
}: {
  label: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  color?: "blue" | "green" | "red" | "yellow" | "purple";
}) {
  const colorClasses = {
    blue: "text-blue-500",
    green: "text-green-500",
    red: "text-red-500",
    yellow: "text-yellow-500",
    purple: "text-purple-500",
  };

  return (
    <div className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          {label}
        </span>
        {icon && <div className={`w-4 h-4 ${colorClasses[color]}`}>{icon}</div>}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-zinc-900 dark:text-white">
          {value}
        </span>
        {unit && (
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

