"use client";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: number | string;
  subtext?: string;
  icon: React.ReactNode;
  color: string;
  trend?: { value: number; direction: "up" | "down" };
}

export default function StatCard({
  title,
  value,
  subtext,
  icon,
  color,
  trend,
}: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 12px 30px rgba(0,0,0,0.1)" }}
      className={`${color} rounded-2xl p-6 border border-opacity-30 backdrop-blur-sm transition-all`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
              {typeof value === "number" ? value.toLocaleString() : value}
            </h3>
            {trend && (
              <span
                className={`text-xs font-semibold ${
                  trend.direction === "up" ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend.direction === "up" ? "↑" : "↓"} {trend.value}%
              </span>
            )}
          </div>
          {subtext && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {subtext}
            </p>
          )}
        </div>
        <div className="w-12 h-12 rounded-xl bg-white bg-opacity-30 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
