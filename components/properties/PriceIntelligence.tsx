"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { cn } from "@/utils/cn";
import axios from "axios";

interface TrendPoint {
  month: string;
  avgPrice: number;
}

interface PriceIntelligenceData {
  cityAvgPrice?: number;
  medianPrice?: number;
  fairPriceRange?: { min: number; max: number };
  pricePosition?: string;
  percentageDiff?: number;
  trend?: TrendPoint[];
  totalListingsInCity?: number;
  lastUpdated?: string | Date;
}

interface Props {
  propertyId: string;
  /** Optionally pass stored data to show immediately while fresh data loads */
  stored?: PriceIntelligenceData | null;
}

function TrendChart({ trend }: { trend: TrendPoint[] }) {
  if (!trend || trend.length < 2) return null;

  const WIDTH = 300;
  const HEIGHT = 80;
  const PADDING = { top: 8, bottom: 20, left: 8, right: 8 };

  const prices = trend.map((t) => t.avgPrice);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;

  const chartW = WIDTH - PADDING.left - PADDING.right;
  const chartH = HEIGHT - PADDING.top - PADDING.bottom;

  const points = trend.map((t, i) => {
    const x = PADDING.left + (i / (trend.length - 1)) * chartW;
    const y = PADDING.top + chartH - ((t.avgPrice - minPrice) / priceRange) * chartH;
    return { x, y, ...t };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-20" aria-label="Price trend chart">
      <polyline points={polylinePoints} fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p) => (
        <circle key={p.month} cx={p.x} cy={p.y} r="3" fill="#f43f5e" />
      ))}
      <text x={points[0].x} y={HEIGHT - 4} fontSize="8" fill="#a1a1aa" textAnchor="start">{points[0].month}</text>
      <text x={points[points.length - 1].x} y={HEIGHT - 4} fontSize="8" fill="#a1a1aa" textAnchor="end">{points[points.length - 1].month}</text>
    </svg>
  );
}

export default function PriceIntelligence({ propertyId, stored }: Props) {
  const [pi, setPi] = useState<PriceIntelligenceData | null>(stored ?? null);
  const [loading, setLoading] = useState(!stored);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const { data } = await axios.get(`/api/properties/${propertyId}/price-intelligence`);
      setPi(data.data.priceIntelligence);
    } catch { /* silent */ }
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetch(); }, [propertyId]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3 shadow-sm animate-pulse">
        <div className="h-4 w-36 bg-zinc-100 dark:bg-zinc-800 rounded" />
        <div className="h-8 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
        <div className="h-20 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
      </div>
    );
  }

  if (!pi) return null;

  const { pricePosition, percentageDiff, cityAvgPrice, medianPrice, trend, totalListingsInCity } = pi;

  const badge = (() => {
    if (pricePosition === "below_average")
      return { label: "Below Market 🎉", className: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300" };
    if (pricePosition === "above_average")
      return { label: "Above Market", className: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" };
    return { label: "Fair Price ✓", className: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300" };
  })();

  const diffText = (() => {
    if (percentageDiff === undefined || percentageDiff === null) return null;
    const abs = Math.abs(percentageDiff);
    if (percentageDiff < -1) return `${abs}% cheaper than city average`;
    if (percentageDiff > 1) return `${abs}% above city average`;
    return "Priced at the city average";
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Price Intelligence</h3>
        <button
          onClick={() => fetch(true)}
          disabled={refreshing}
          className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          title="Refresh price data"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />
        </button>
      </div>

      {/* Badge + diff */}
      <div className="flex flex-wrap items-center gap-3">
        <span className={cn("px-3 py-1 rounded-full text-xs font-semibold", badge.className)}>
          {badge.label}
        </span>
        {diffText && <span className="text-sm text-zinc-500 dark:text-zinc-400">{diffText}</span>}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        {cityAvgPrice !== undefined && (
          <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-3">
            <p className="text-[10px] text-zinc-400 uppercase tracking-wide mb-0.5">City Avg</p>
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              ₹{Math.round(cityAvgPrice).toLocaleString("en-IN")}
            </p>
          </div>
        )}
        {medianPrice !== undefined && (
          <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-3">
            <p className="text-[10px] text-zinc-400 uppercase tracking-wide mb-0.5">Median</p>
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              ₹{Math.round(medianPrice).toLocaleString("en-IN")}
            </p>
          </div>
        )}
      </div>

      {totalListingsInCity !== undefined && (
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          Based on {totalListingsInCity} active listings in this city
        </p>
      )}

      {/* Trend chart */}
      {trend && trend.length >= 2 && (
        <div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-1">
            Price trend (last {trend.length} months)
          </p>
          <TrendChart trend={trend} />
        </div>
      )}
    </motion.div>
  );
}
