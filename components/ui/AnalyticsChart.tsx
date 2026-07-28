"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { GlassCard } from "./GlassCard";

interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface AnalyticsChartProps {
  title: string;
  data: ChartDataPoint[];
  type?: "bar" | "line" | "progress";
  height?: number;
  showLegend?: boolean;
  showValues?: boolean;
  maxValue?: number;
  unit?: string;
}

export function AnalyticsChart({
  title,
  data,
  type = "bar",
  height = 300,
  showLegend = true,
  showValues = true,
  maxValue,
  unit = "",
}: AnalyticsChartProps) {
  const max = maxValue || Math.max(...data.map((d) => d.value), 1);

  const colors = [
    "#3b82f6", // blue
    "#10b981", // green
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // purple
    "#ec4899", // pink
  ];

  const getColor = (index: number, color?: string) => color || colors[index % colors.length];

  if (type === "bar") {
    return (
      <GlassCard className="p-6 space-y-6">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
          {title}
        </h3>

        <div
          className="space-y-4"
          style={{ height: `${height}px` }}
        >
          {data.map((item, index) => {
            const percentage = (item.value / max) * 100;
            return (
              <motion.div
                key={item.label}
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {item.label}
                  </span>
                  {showValues && (
                    <span className="text-sm font-bold text-zinc-900 dark:text-white">
                      {item.value}
                      {unit}
                    </span>
                  )}
                </div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="h-2 rounded-full bg-gradient-to-r"
                  style={{
                    backgroundImage: `linear-gradient(90deg, ${getColor(
                      index,
                      item.color
                    )}, ${getColor(index, item.color)}dd)`,
                  }}
                />
              </motion.div>
            );
          })}
        </div>

        {showLegend && (
          <div className="flex flex-wrap gap-4 pt-4 border-t border-white/10">
            {data.map((item, index) => (
              <div key={item.label} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getColor(index, item.color) }}
                />
                <span className="text-xs text-zinc-600 dark:text-zinc-400">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    );
  }

  if (type === "progress") {
    return (
      <GlassCard className="p-6 space-y-6">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
          {title}
        </h3>

        <div className="space-y-6">
          {data.map((item, index) => {
            const percentage = (item.value / max) * 100;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {item.label}
                  </span>
                  <span className="text-sm font-bold text-zinc-900 dark:text-white">
                    {Math.round(percentage)}%
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${getColor(
                        index,
                        item.color
                      )}, ${getColor(index, item.color)}88)`,
                    }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </GlassCard>
    );
  }

  // Line/Area chart simulation
  return (
    <GlassCard className="p-6 space-y-6">
      <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
        {title}
      </h3>

      <div
        className="flex items-end gap-2 justify-center px-4"
        style={{ height: `${height}px` }}
      >
        {data.map((item, index) => {
          const percentage = (item.value / max) * 100;
          return (
            <motion.div
              key={item.label}
              initial={{ height: 0 }}
              animate={{ height: `${percentage}%` }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="flex-1 rounded-t-lg group relative"
              style={{
                background: `linear-gradient(180deg, ${getColor(
                  index,
                  item.color
                )}, ${getColor(index, item.color)}44)`,
              }}
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold px-2 py-1 rounded whitespace-nowrap">
                  {item.value}
                  {unit}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {showLegend && (
        <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10 justify-center">
          {data.map((item, index) => (
            <div key={item.label} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getColor(index, item.color) }}
              />
              <span className="text-xs text-zinc-600 dark:text-zinc-400">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}

export function MiniChart({
  data,
  height = 80,
  showLabel = false,
}: {
  data: ChartDataPoint[];
  height?: number;
  showLabel?: boolean;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

  return (
    <div
      className="flex items-end gap-1 justify-center"
      style={{ height: `${height}px` }}
    >
      {data.map((item, index) => {
        const percentage = (item.value / max) * 100;
        return (
          <motion.div
            key={item.label}
            initial={{ height: 0 }}
            animate={{ height: `${percentage}%` }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="flex-1 rounded-t bg-gradient-to-t from-blue-500 to-cyan-500 opacity-80"
          />
        );
      })}
    </div>
  );
}

