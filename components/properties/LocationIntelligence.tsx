"use client";

import { motion, type Variants } from "framer-motion";
import { cn } from "@/utils/cn";

interface NearbyAmenity {
  type: string;
  name: string;
  distanceKm: number;
  walkTimeMinutes: number;
}

interface LocationIntelligenceData {
  nearbyAmenities: NearbyAmenity[];
  safetyScore?: number;
  safetyLabel?: string;
  lastUpdated?: string | Date;
}

interface PropertyWithLocationIntelligence {
  locationIntelligence?: LocationIntelligenceData | null;
}

interface Props {
  property: PropertyWithLocationIntelligence;
}

const AMENITY_ICONS: Record<string, string> = {
  metro: "🚇",
  school: "🏫",
  hospital: "🏥",
  mall: "🛍️",
  park: "🌳",
  restaurant: "🍽️",
};

function getSafetyBadge(score: number): { label: string; className: string } {
  if (score >= 70) return { label: "Very Safe", className: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300" };
  if (score >= 50) return { label: "Safe", className: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300" };
  if (score >= 30) return { label: "Moderate", className: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" };
  return { label: "Use Caution", className: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300" };
}

function groupByType(amenities: NearbyAmenity[]): Record<string, NearbyAmenity[]> {
  return amenities.reduce<Record<string, NearbyAmenity[]>>((acc, amenity) => {
    const key = amenity.type.toLowerCase();
    if (!acc[key]) acc[key] = [];
    acc[key].push(amenity);
    return acc;
  }, {});
}

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function LocationIntelligence({ property }: Props) {
  const li = property?.locationIntelligence;
  if (!li || !li.nearbyAmenities || li.nearbyAmenities.length === 0) return null;

  const grouped = groupByType(li.nearbyAmenities);
  const safetyBadge = li.safetyScore !== undefined ? getSafetyBadge(li.safetyScore) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4 shadow-sm"
    >
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Location Intelligence</h3>
        {safetyBadge && li.safetyScore !== undefined && (
          <div className="flex items-center gap-2">
            <span className={cn("px-3 py-1 rounded-full text-xs font-semibold", safetyBadge.className)}>
              {safetyBadge.label}
            </span>
            <span className="text-xs text-zinc-400">Safety {li.safetyScore}/100</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {Object.entries(grouped).map(([type, items]) => (
          <div key={type}>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2 capitalize">
              {AMENITY_ICONS[type] ?? "📍"} {type}
            </p>
            <motion.ul
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-2"
            >
              {items.map((amenity, i) => (
                <motion.li
                  key={`${amenity.name}-${i}`}
                  variants={itemVariants}
                  className="flex items-center justify-between bg-zinc-50 rounded-xl px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span>{AMENITY_ICONS[type] ?? "📍"}</span>
                    <span className="text-zinc-700 font-medium">{amenity.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-zinc-400 text-xs">
                    <span>{amenity.distanceKm} km</span>
                    <span>{amenity.walkTimeMinutes} min walk</span>
                  </div>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
