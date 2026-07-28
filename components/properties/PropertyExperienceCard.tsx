"use client";

import { motion } from "framer-motion";
import { MapPin, Zap, Award, Home, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Property } from "@/store/propertyStore";
import {
  generatePropertyHighlights,
  generatePropertyScore,
  formatPrice,
} from "@/lib/propertyExperienceUtils";
import Badge from "@/components/ui/Badge";

interface PropertyExperienceCardProps {
  property: Property;
  showComparison?: boolean;
  onAddComparison?: () => void;
}

export default function PropertyExperienceCard({
  property,
  showComparison,
  onAddComparison,
}: PropertyExperienceCardProps) {
  const highlights = generatePropertyHighlights(property);
  const score = generatePropertyScore(property);
  const scoreColor =
    score >= 75 ? "text-green-600" : score >= 50 ? "text-amber-600" : "text-red-600";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="relative bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all group"
    >
      {/* Score Badge */}
      <div className="absolute top-3 right-3 z-20">
        <motion.div
          whileHover={{ scale: 1.1 }}
          className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${scoreColor} bg-white dark:bg-zinc-800 border-2 ${scoreColor} shadow-md`}
        >
          {score}
        </motion.div>
      </div>

      {/* Image */}
      <Link href={`/properties/${property._id}`}>
        <div className="relative w-full h-48 bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800 overflow-hidden">
          {property.images?.[0] ? (
            <Image
              src={property.images[0]}
              alt={property.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-400">
              <Home className="w-12 h-12" />
            </div>
          )}

          {/* Overlays */}
          {property.tour360 && property.tour360.length > 0 && (
            <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
              📸 360°
            </div>
          )}

          {property.instantBooking && (
            <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
              <Zap className="w-3 h-3" /> Instant
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title & Location */}
        <Link href={`/properties/${property._id}`}>
          <div className="hover:text-blue-600 transition-colors">
            <h3 className="font-bold text-zinc-900 dark:text-white truncate">
              {property.title}
            </h3>
            <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">
                {property.location.city}, {property.location.country}
              </span>
            </div>
          </div>
        </Link>

        {/* Highlights */}
        {highlights.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {highlights.slice(0, 3).map((h) => (
              <Badge key={h} variant="info" className="text-xs">
                {h}
              </Badge>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 py-2 border-y border-zinc-100 dark:border-zinc-800">
          <div className="text-center">
            <p className="text-lg font-bold text-zinc-900 dark:text-white">
              {property.bedrooms}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Beds</p>
          </div>
          <div className="text-center border-l border-r border-zinc-100 dark:border-zinc-800">
            <p className="text-lg font-bold text-zinc-900 dark:text-white">
              {property.bathrooms}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Baths</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-zinc-900 dark:text-white">
              {property.area || "—"}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">sqm</p>
          </div>
        </div>

        {/* Price & Rating */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-rose-500">
              {formatPrice(property.price)}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              per month
            </p>
          </div>

          {property.averageRating > 0 && (
            <div className="flex items-center gap-1 px-3 py-2 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
              <Award className="w-4 h-4 text-amber-500" />
              <span className="font-bold text-amber-700 dark:text-amber-400">
                {property.averageRating.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* CTA Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Link
            href={`/properties/${property._id}`}
            className="px-3 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-medium text-sm transition-colors text-center"
          >
            View Details
          </Link>

          {showComparison && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onAddComparison}
              className="px-3 py-2 rounded-lg border-2 border-blue-500 text-blue-600 dark:text-blue-400 font-medium text-sm hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors"
            >
              Compare
            </motion.button>
          )}
        </div>
      </div>

      {/* Experience Badge */}
      <div className="absolute bottom-16 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-semibold flex items-center gap-1"
        >
          <span>✨ 360° Experience</span>
        </motion.div>
      </div>
    </motion.div>
  );
}
