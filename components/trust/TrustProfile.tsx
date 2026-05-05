"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useApi } from "@/hooks/useApi";
import { cn } from "@/utils/cn";

interface TrustData {
  level: "low" | "medium" | "high";
  profileCompleteness: number;
  badges: string[];
}

const BADGE_CONFIG: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  verified_owner: {
    label: "Verified Owner",
    color: "bg-green-100 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800",
    icon: "🛡️",
  },
  verified_tenant: {
    label: "Verified Tenant",
    color: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
    icon: "✅",
  },
  safe_deal_guarantee: {
    label: "Safe Deal",
    color: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
    icon: "⭐",
  },
  top_rated: {
    label: "Top Rated",
    color: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
    icon: "🌟",
  },
  quick_responder: {
    label: "Quick Responder",
    color: "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800",
    icon: "⚡",
  },
};

export default function TrustProfile({ userId }: { userId: string }) {
  const { authHeaders } = useApi();
  const [data, setData] = useState<TrustData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const fetch = async () => {
      try {
        const res = await axios.get(`/api/trust?userId=${userId}`, authHeaders());
        setData(res.data.data);
      } catch {
        // silently fail — trust info is supplementary
      } finally {
        setLoading(false);
      }
    };
    fetch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  if (loading) {
    return (
      <div className="h-20 rounded-2xl bg-zinc-100 animate-pulse" />
    );
  }

  if (!data) return null;

  const { level, profileCompleteness, badges } = data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm p-5 space-y-4"
    >
      {/* Profile completeness */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Profile Completeness</span>
          <span className="text-sm font-semibold text-zinc-900 dark:text-white">{profileCompleteness}%</span>
        </div>
        <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
          <motion.div
            className={cn(
              "h-full rounded-full",
              profileCompleteness >= 80
                ? "bg-green-500"
                : profileCompleteness >= 50
                ? "bg-amber-400"
                : "bg-rose-400"
            )}
            initial={{ width: 0 }}
            animate={{ width: `${profileCompleteness}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Trust badges */}
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {badges.map((badge, i) => {
            const cfg = BADGE_CONFIG[badge];
            if (!cfg) return null;
            return (
              <motion.span
                key={badge}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border",
                  cfg.color
                )}
              >
                {cfg.icon} {cfg.label}
              </motion.span>
            );
          })}
        </div>
      )}

      {/* Fraud risk badge — only medium/high */}
      {(level === "medium" || level === "high") && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold",
            level === "high"
              ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300"
              : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
          )}
        >
          {level === "high" ? "🚨 High Risk" : "⚠️ Caution"}
        </motion.div>
      )}
    </motion.div>
  );
}
