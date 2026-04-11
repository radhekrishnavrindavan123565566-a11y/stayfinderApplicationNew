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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-zinc-100"
    >
      <Link href={`/properties/${property._id}`}>
        <div className="relative h-52 overflow-hidden">
          <Image
            src={image}
            alt={property.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <Badge
            variant="default"
            className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-zinc-700 capitalize"
          >
            {property.propertyType}
          </Badge>
          {(property as Property & { isBoosted?: boolean }).isBoosted && (
            <div className="absolute top-3 left-3 mt-7">
              <Badge variant="default" className="bg-orange-500 text-white flex items-center gap-1">
                <Zap className="w-3 h-3" /> Featured
              </Badge>
            </div>
          )}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleWishlist}
              className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm"
            >
              <Heart className={`w-4 h-4 transition-colors ${isWishlisted ? "fill-rose-500 text-rose-500" : "text-zinc-600"}`} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCompare}
              className={cn("w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center shadow-sm transition-colors", isComparing ? "bg-blue-600" : "bg-white/90")}
            >
              <GitCompare className={cn("w-4 h-4", isComparing ? "text-white" : "text-zinc-600")} />
            </motion.button>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-zinc-900 text-sm leading-tight line-clamp-1 group-hover:text-rose-500 transition-colors">
              {property.title}
            </h3>
            {property.averageRating > 0 && (
              <div className="flex items-center gap-1 shrink-0">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-xs font-medium text-zinc-700">{property.averageRating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 text-zinc-500 mb-3">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="text-xs truncate">{property.location.city}, {property.location.country}</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-zinc-500 mb-3">
            <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" />{property.bedrooms} bed</span>
            <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" />{property.bathrooms} bath</span>
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{property.maxGuests} guests</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-zinc-900">₹{property.price.toLocaleString("en-IN")}</span>
              <span className="text-xs text-zinc-500"> / month</span>
            </div>
            {property.totalReviews > 0 && (
              <span className="text-xs text-zinc-400">{property.totalReviews} reviews</span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <MatchScoreBadge propertyId={property._id} />
            <SmartTags tags={[]} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
