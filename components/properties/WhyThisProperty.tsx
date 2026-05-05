"use client";
import { motion } from "framer-motion";
import SmartTags from "./SmartTags";

interface Breakdown {
  budget: number;
  bedrooms: number;
  amenities: number;
  location: number;
  tenantType: number;
}

interface WhyThisPropertyProps {
  score: number;
  reasons: string[];
  tags: string[];
  breakdown: Breakdown;
  onClose: () => void;
}

const BREAKDOWN_LABELS: { key: keyof Breakdown; label: string; max: number }[] = [
  { key: "budget", label: "Budget", max: 25 },
  { key: "bedrooms", label: "Bedrooms", max: 20 },
  { key: "amenities", label: "Amenities", max: 20 },
  { key: "location", label: "Location", max: 20 },
  { key: "tenantType", label: "Tenant Type", max: 15 },
];

export default function WhyThisProperty({ score, reasons, tags, breakdown, onClose }: WhyThisPropertyProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Why this property?</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-500 dark:text-zinc-400 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Score */}
        <div className="text-center py-2">
          <span className="text-5xl font-black text-zinc-900 dark:text-white">{score}</span>
          <span className="text-xl text-zinc-400 font-medium">% Match</span>
        </div>

        {/* Breakdown bars */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Score Breakdown</p>
          {BREAKDOWN_LABELS.map(({ key, label, max }, i) => {
            const value = breakdown[key];
            const pct = max > 0 ? (value / max) * 100 : 0;
            return (
              <div key={key}>
                <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400 mb-1">
                  <span>{label}</span>
                  <span className="font-medium">{value}/{max}</span>
                </div>
                <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: i * 0.08, duration: 0.5, ease: "easeOut" }}
                    className="h-full bg-rose-400 rounded-full"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Reasons */}
        {reasons.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Reasons</p>
            <ul className="space-y-1">
              {reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                  <span className="text-green-500 mt-0.5">✓</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Tags</p>
            <SmartTags tags={tags} />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
