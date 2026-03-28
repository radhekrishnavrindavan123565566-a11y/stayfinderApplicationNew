"use client";

import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

interface TrendPoint {
  month: string;
  avgPrice: number;
}

interface PriceIntelligenceData {
  cityAvgPrice?: number;
  fairPriceRange?: { min: number; max: number };
  pricePosition?: string;
  percentageDiff?: number;
  trend?: TrendPoint[];
  lastUpdated?: string | Date;
}

interface PropertyWithPriceIntelligence {
  priceIntelligence?: PriceIntelligenceData | null;
}

interface Props {
  property: PropertyWithPriceIntelligence;
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
      {/* Polyline */}
      <polyline
        points={polylinePoints}
        fill="none"
        stroke="#f43f5e"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Dots */}
      {points.map((p) => (
        <circle key={p.month} cx={p.x} cy={p.y} r="3" fill="#f43f5e" />
      ))}
      {/* X-axis labels — first and last month */}
      <text x={points[0].x} y={HEIGHT - 4} fontSize="8" fill="#a1a1aa" textAnchor="start">
        {points[0].month}
      </text>
      <text x={points[points.length - 1].x} y={HEIGHT - 4} fontSize="8" fill="#a1a1aa" textAnchor="end">
        {points[points.length - 1].month}
      </text>
    </svg>
  );
}

export default function PriceIntelligence({ property }: Props) {
  const pi = property?.priceIntelligence;
  if (!pi) return null;

  const { pricePosition, percentageDiff, cityAvgPrice, trend } = pi;

  const badge = (() => {
    if (pricePosition === "below_average")
      return { label: "Below Average 🎉", className: "bg-blue-100 text-blue-700" };
    if (pricePosition === "above_average")
      return { label: "Above Average", className: "bg-amber-100 text-amber-700" };
    return { label: "Fair Price", className: "bg-green-100 text-green-700" };
  })();

  const diffText = (() => {
    if (percentageDiff === undefined || percentageDiff === null) return null;
    const abs = Math.abs(percentageDiff);
    if (percentageDiff < 0) return `${abs}% cheaper than average`;
    if (percentageDiff > 0) return `${abs}% above average`;
    return "Priced at the city average";
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="rounded-2xl border border-zinc-100 bg-white p-5 space-y-4 shadow-sm"
    >
      <h3 className="text-base font-semibold text-zinc-900">Price Intelligence</h3>

      {/* Badge + diff */}
      <div className="flex flex-wrap items-center gap-3">
        <span className={cn("px-3 py-1 rounded-full text-xs font-semibold", badge.className)}>
          {badge.label}
        </span>
        {diffText && <span className="text-sm text-zinc-500">{diffText}</span>}
      </div>

      {/* City avg */}
      {cityAvgPrice !== undefined && (
        <p className="text-sm text-zinc-500">
          Area avg:{" "}
          <span className="font-medium text-zinc-700">
            ₹{Math.round(cityAvgPrice).toLocaleString("en-IN")}/night
          </span>
        </p>
      )}

      {/* Trend chart */}
      {trend && trend.length >= 2 && (
        <div>
          <p className="text-xs text-zinc-400 mb-1">Price trend (last {trend.length} months)</p>
          <TrendChart trend={trend} />
        </div>
      )}
    </motion.div>
  );
}
