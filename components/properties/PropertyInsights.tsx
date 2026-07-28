"use client";

import { motion } from "framer-motion";
import { TrendingUp, AlertCircle, Check, Zap } from "lucide-react";

interface PropertyInsightsProps {
  price: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  rating?: number;
  area?: number;
  cityAvgPrice?: number;
  weeklyBookings?: number;
}

export default function PropertyInsights({
  price,
  bedrooms,
  bathrooms,
  amenities,
  rating,
  area,
  cityAvgPrice,
  weeklyBookings,
}: PropertyInsightsProps) {
  const insights = [];

  // Price insight
  if (cityAvgPrice && price < cityAvgPrice) {
    insights.push({
      type: "positive",
      icon: <TrendingUp className="w-4 h-4" />,
      title: "Great Price",
      description: `${((1 - price / cityAvgPrice) * 100).toFixed(0)}% below city average`,
    });
  }

  if (cityAvgPrice && price > cityAvgPrice * 1.2) {
    insights.push({
      type: "warning",
      icon: <AlertCircle className="w-4 h-4" />,
      title: "Premium Pricing",
      description: `${((price / cityAvgPrice - 1) * 100).toFixed(0)}% above city average`,
    });
  }

  // Space insight
  if (area && bedrooms > 0) {
    const sqmPerBedroom = area / bedrooms;
    if (sqmPerBedroom > 20) {
      insights.push({
        type: "positive",
        icon: <Check className="w-4 h-4" />,
        title: "Spacious Layout",
        description: `${sqmPerBedroom.toFixed(0)} sqm per bedroom`,
      });
    }
  }

  // Amenities insight
  if (amenities.length > 8) {
    insights.push({
      type: "positive",
      icon: <Zap className="w-4 h-4" />,
      title: "Well Equipped",
      description: `${amenities.length} amenities available`,
    });
  }

  // Popularity insight
  if (weeklyBookings && weeklyBookings > 5) {
    insights.push({
      type: "positive",
      icon: <TrendingUp className="w-4 h-4" />,
      title: "Popular Property",
      description: `${weeklyBookings}+ bookings per week`,
    });
  }

  // Rating insight
  if (rating && rating >= 4.5) {
    insights.push({
      type: "positive",
      icon: <Check className="w-4 h-4" />,
      title: "Highly Rated",
      description: `${rating.toFixed(1)}⭐ from verified guests`,
    });
  }

  if (insights.length === 0) {
    return null;
  }

  const colorMap = {
    positive: {
      bg: "bg-green-50 dark:bg-green-950/20",
      border: "border-green-100 dark:border-green-800",
      badge: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400",
      icon: "text-green-600 dark:text-green-400",
    },
    warning: {
      bg: "bg-amber-50 dark:bg-amber-950/20",
      border: "border-amber-100 dark:border-amber-800",
      badge: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400",
      icon: "text-amber-600 dark:text-amber-400",
    },
    info: {
      bg: "bg-blue-50 dark:bg-blue-950/20",
      border: "border-blue-100 dark:border-blue-800",
      badge: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400",
      icon: "text-blue-600 dark:text-blue-400",
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
        <span className="w-5 h-5 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs">
          ✨
        </span>
        Smart Insights
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {insights.map((insight, idx) => {
          const colors =
            colorMap[insight.type as keyof typeof colorMap] ||
            colorMap.info;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`p-3 rounded-lg border ${colors.bg} ${colors.border}`}
            >
              <div className="flex items-start gap-2">
                <div className={`flex-shrink-0 p-1.5 rounded-md ${colors.badge}`}>
                  {insight.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-zinc-900 dark:text-white">
                    {insight.title}
                  </p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                    {insight.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        💡 These insights help you make a quick decision
      </p>
    </motion.div>
  );
}
