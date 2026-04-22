"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Heart, Star, MapPin, Bed, Bath, Users, GitCompare, Zap } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Property } from "@/store/propertyStore";
import { useCompareStore } from "@/store/compareStore";
import toast from "react-hot-toast";
import Badge from "@/components/ui/Badge";
import { cn } from "@/utils/cn";
import MatchScoreBadge from "@/components/properties/MatchScoreBadge";
import SmartTags from "@/components/properties/SmartTags";

interface PropertyCardProps {
  property: Property;
  index?: number;
}

const TYPE_COLORS: Record<string, string> = {
  apartment: "bg-blue-500/90",
  house:     "bg-rose-500/90",
  villa:     "bg-amber-500/90",
  studio:    "bg-purple-500/90",
  cabin:     "bg-green-500/90",
  condo:     "bg-indigo-500/90",
};

export default function PropertyCard({ property, index = 0 }: PropertyCardProps) {
  const { user, toggleWishlist } = useAuthStore();
  const { add, remove, has } = useCompareStore();
  const isWishlisted = user?.wishlist?.includes(property._id);
  const isComparing = has(property._id);

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) { toast.error("Please login to save properties"); return; }
    await toggleWishlist(property._id);
    toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isComparing) { remove(property._id); toast.success("Removed from compare"); }
    else { add(property._id); toast.success("Added to compare"); }
  };

  const image = property.images?.[0] || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800";
  const typeColor = TYPE_COLORS[property.propertyType] || "bg-zinc-700/90";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -6 }}
      className="group bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-zinc-200/60 dark:hover:shadow-zinc-900/60 transition-all duration-300 border border-zinc-100 dark:border-zinc-800"
    >
      <Link href={`/properties/${property._id}`}>
        {/* Image */}
        <div className="relative h-52 overflow-hidden">
          <Image
            src={image}
            alt={property.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-110 transition-transform duration-700"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Type badge */}
          <div className={`absolute top-3 left-3 ${typeColor} backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full capitalize`}>
            {property.propertyType}
          </div>

          {/* Boosted badge */}
          {(property as Property & { isBoosted?: boolean }).isBoosted && (
            <div className="absolute top-3 left-3 mt-7">
              <Badge variant="default" className="bg-orange-500 text-white flex items-center gap-1 text-[11px]">
                <Zap className="w-3 h-3" /> Featured
              </Badge>
            </div>
          )}

          {/* Action buttons */}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5">
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleWishlist}
              className={cn(
                "w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center shadow-md transition-colors",
                isWishlisted ? "bg-rose-500" : "bg-white/90"
              )}
            >
              <Heart className={cn("w-4 h-4 transition-colors", isWishlisted ? "fill-white text-white" : "text-zinc-600")} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCompare}
              className={cn(
                "w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center shadow-md transition-colors",
                isComparing ? "bg-blue-600" : "bg-white/90"
              )}
            >
              <GitCompare className={cn("w-4 h-4", isComparing ? "text-white" : "text-zinc-600")} />
            </motion.button>
          </div>

          {/* Rating pill on image */}
          {property.averageRating > 0 && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-bold text-zinc-800 dark:text-white">{property.averageRating.toFixed(1)}</span>
              {property.totalReviews > 0 && (
                <span className="text-[10px] text-zinc-400">({property.totalReviews})</span>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold text-zinc-900 dark:text-white text-sm leading-tight line-clamp-1 group-hover:text-rose-500 transition-colors mb-1">
            {property.title}
          </h3>

          <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 mb-3">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-rose-400" />
            <span className="text-xs truncate">{property.location.city}, {property.location.country}</span>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 mb-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <span className="flex items-center gap-1">
              <Bed className="w-3.5 h-3.5 text-blue-400" />{property.bedrooms} bed
            </span>
            <span className="flex items-center gap-1">
              <Bath className="w-3.5 h-3.5 text-cyan-400" />{property.bathrooms} bath
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-purple-400" />{property.maxGuests} guests
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <span className="font-bold text-zinc-900 dark:text-white text-base">
                ₹{property.price.toLocaleString("en-IN")}
              </span>
              <span className="text-xs text-zinc-400">/ month</span>
            </div>
            {property.totalReviews > 0 && (
              <span className="text-[10px] text-zinc-400 bg-zinc-50 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                {property.totalReviews} reviews
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <MatchScoreBadge propertyId={property._id} />
            <SmartTags tags={[]} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
