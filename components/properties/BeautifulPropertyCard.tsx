"use client";

import { motion } from "framer-motion";
import { Heart, MapPin, Star, Users, Wifi, Home } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { GlassCard, GlassBadge } from "@/components/ui";

interface PropertyCardFeature {
  icon: React.ReactNode;
  label: string;
}

interface BeautifulPropertyCardProps {
  id: string;
  title: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  type: "apartment" | "house" | "condo" | "villa";
  beds: number;
  baths: number;
  sqft: number;
  amenities?: string[];
  featured?: boolean;
  onClick?: () => void;
  delay?: number;
}

const amenityIcons: Record<string, React.ReactNode> = {
  wifi: <Wifi className="w-4 h-4" />,
  home: <Home className="w-4 h-4" />,
  users: <Users className="w-4 h-4" />,
};

export function BeautifulPropertyCard({
  id,
  title,
  location,
  price,
  rating,
  reviews,
  image,
  type,
  beds,
  baths,
  sqft,
  amenities = [],
  featured = false,
  onClick,
  delay = 0,
}: BeautifulPropertyCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -8 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className="cursor-pointer"
    >
      <GlassCard
        hover
        className="overflow-hidden h-full"
      >
        {/* Image Section */}
        <div className="relative h-48 overflow-hidden bg-zinc-200 dark:bg-zinc-700">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-500"
            style={{
              transform: isHovered ? "scale(1.1)" : "scale(1)",
            }}
          />

          {/* Featured Badge */}
          {featured && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-3 left-3"
            >
              <GlassBadge className="bg-gradient-to-r from-amber-500/80 to-orange-500/80">
                ✨ Featured
              </GlassBadge>
            </motion.div>
          )}

          {/* Rating Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="absolute top-3 right-3"
          >
            <div className="flex items-center gap-1 px-3 py-1 bg-yellow-500/80 backdrop-blur-md rounded-full text-white text-sm font-bold">
              <Star className="w-4 h-4 fill-current" />
              {rating}
            </div>
          </motion.div>

          {/* Favorite Button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              setIsFavorited(!isFavorited);
            }}
            className="absolute bottom-3 right-3 p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md transition-all"
          >
            <Heart
              className="w-5 h-5 transition-colors"
              fill={isFavorited ? "currentColor" : "none"}
              color={isFavorited ? "#ef4444" : "white"}
            />
          </motion.button>

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        {/* Content Section */}
        <div className="p-5 space-y-4">
          {/* Type Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <GlassBadge className="bg-blue-500/30">
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </GlassBadge>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white line-clamp-2">
              {title}
            </h3>
          </motion.div>

          {/* Location */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400"
          >
            <MapPin className="w-4 h-4 flex-shrink-0 text-blue-500" />
            <span className="line-clamp-1">{location}</span>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="grid grid-cols-3 gap-2 py-3 px-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg"
          >
            <div className="text-center">
              <p className="text-lg font-bold text-zinc-900 dark:text-white">
                {beds}
              </p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Beds</p>
            </div>
            <div className="text-center border-l border-r border-zinc-200 dark:border-zinc-700">
              <p className="text-lg font-bold text-zinc-900 dark:text-white">
                {baths}
              </p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Baths</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-zinc-900 dark:text-white">
                {(sqft / 1000).toFixed(1)}k
              </p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">sqft</p>
            </div>
          </motion.div>

          {/* Amenities */}
          {amenities.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex gap-2 flex-wrap pt-2"
            >
              {amenities.slice(0, 3).map((amenity, index) => (
                <GlassBadge
                  key={amenity}
                  className="text-xs bg-zinc-100 dark:bg-zinc-800"
                >
                  {amenityIcons[amenity.toLowerCase()] ||
                    amenityIcons.home}
                  <span className="hidden sm:inline ml-1">{amenity}</span>
                </GlassBadge>
              ))}
              {amenities.length > 3 && (
                <GlassBadge className="text-xs bg-zinc-100 dark:bg-zinc-800">
                  +{amenities.length - 3} more
                </GlassBadge>
              )}
            </motion.div>
          )}

          {/* Price and Reviews */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="flex items-end justify-between pt-4 border-t border-zinc-200 dark:border-zinc-700"
          >
            <div>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                ${price}
              </p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                per night
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {reviews} reviews
              </p>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-zinc-300 dark:text-zinc-700"
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

