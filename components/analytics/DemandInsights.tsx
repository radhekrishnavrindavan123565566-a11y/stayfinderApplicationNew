"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/utils/cn";

interface DemandData {
  cityDemandScore: number;
  peakMonths: string[];
  bestListingTime: string;
  competitorCount: number;
  avgOccupancyRate: number;
  ownerOccupancyRate: number;
  viewsThisWeek: number;
  wishlistsThisWeek: number;
}

function GaugeBar({ score }: { score: number }) {
  const color = score >= 70 ? "bg-green-500" : score >= 40 ? "bg-amber-400" : "bg-rose-500";
  const label = score >= 70 ? "High" : score >= 40 ? "Medium" : "Low";
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <span>City Demand</span>
        <span className="font-semibold text-zinc-800 dark:text-zinc-200">{score}/100 — {label}</span>
      </div>
      <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          className={cn("h-full rounded-full", color)}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function OccupancyBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <span>{label}</span>
        <span className="font-medium text-zinc-700 dark:text-zinc-300">{value}%</span>
      </div>
      <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          className={cn("h-full rounded-full", color)}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export default function DemandInsights({ propertyId }: { propertyId: string }) {
  const { accessToken } = useAuthStore();
  const [data, setData] = useState<DemandData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!propertyId) return;
    setLoading(true);
    axios
      .get(`/api/properties/${propertyId}/demand-insights`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((res) => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [propertyId, accessToken]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-2xl bg-zinc-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Demand score */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-3">Market Demand</h3>
        <GaugeBar score={data.cityDemandScore} />
        <p className="text-xs text-zinc-400 mt-2">{data.competitorCount} competing properties in your city</p>
      </div>

      {/* Peak months + best time */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Seasonal Insights</h3>
        {data.peakMonths.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.peakMonths.map((m) => (
              <span key={m} className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 rounded-full text-xs font-medium">
                🔥 {m}
              </span>
            ))}
          </div>
        )}
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900 rounded-xl px-3 py-2 text-xs text-amber-800 dark:text-amber-300 font-medium">
          💡 {data.bestListingTime}
        </div>
      </div>

      {/* Occupancy */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Occupancy (Last 90 Days)</h3>
        <OccupancyBar label="Your Property" value={data.ownerOccupancyRate} color="bg-blue-500" />
        <OccupancyBar label="City Average" value={data.avgOccupancyRate} color="bg-zinc-400" />
      </div>

      {/* Weekly stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">{data.viewsThisWeek}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">👁️ Total Views</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">{data.wishlistsThisWeek}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">❤️ Wishlisted</p>
        </div>
      </div>
    </motion.div>
  );
}
