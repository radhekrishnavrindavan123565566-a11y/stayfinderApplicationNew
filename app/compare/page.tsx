"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { X, Star, MapPin, Bed, Bath, Users, Check, Minus, ArrowLeft } from "lucide-react";
import axios from "axios";
import { useCompareStore } from "@/store/compareStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/utils/cn";
import Button from "@/components/ui/Button";
import Image from "next/image";

interface Property {
  _id: string;
  title: string;
  price: number;
  location: { city: string; country: string };
  images: string[];
  amenities: string[];
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  averageRating: number;
  totalReviews: number;
  propertyType: string;
  instantBooking: boolean;
  cancellationPolicy: string;
}

const ALL_AMENITIES = ["WiFi", "Parking", "Pool", "Kitchen", "AC", "Gym", "Washer", "TV", "Balcony", "Pet Friendly"];

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function ComparePage() {
  const { ids, remove, clear } = useCompareStore();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (ids.length === 0) { setIsLoading(false); return; }
    const fetchAll = async () => {
      try {
        const results = await Promise.all(ids.map((id) => axios.get(`/api/properties/${id}`)));
        setProperties(results.map((r) => r.data.data.property));
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, [ids]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (ids.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 bg-zinc-50 dark:bg-zinc-950 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">⚖️</div>
          <h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Nothing to compare yet</h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-6">Add properties to compare from the listings page</p>
          <Link href="/properties">
            <Button>Browse Properties</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const rows = [
    { label: "Price/month", render: (p: Property) => <span className="font-bold text-rose-500">₹{p.price.toLocaleString("en-IN")}</span> },
    { label: "Type", render: (p: Property) => <span className="capitalize">{p.propertyType}</span> },
    { label: "Bedrooms", render: (p: Property) => <span className="flex items-center gap-1 justify-center"><Bed className="w-3.5 h-3.5" />{p.bedrooms}</span> },
    { label: "Bathrooms", render: (p: Property) => <span className="flex items-center gap-1 justify-center"><Bath className="w-3.5 h-3.5" />{p.bathrooms}</span> },
    { label: "Max Guests", render: (p: Property) => <span className="flex items-center gap-1 justify-center"><Users className="w-3.5 h-3.5" />{p.maxGuests}</span> },
    { label: "Rating", render: (p: Property) => <span className="flex items-center gap-1 justify-center"><Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />{p.averageRating.toFixed(1)} ({p.totalReviews})</span> },
    { label: "Instant Booking", render: (p: Property) => p.instantBooking ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <Minus className="w-4 h-4 text-zinc-300 mx-auto" /> },
    { label: "Cancellation", render: (p: Property) => <span className="capitalize text-xs">{p.cancellationPolicy}</span> },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between py-6 mb-2"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">Compare Properties</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{properties.length} properties selected</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clear}
            className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 px-3 py-1.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <X className="w-4 h-4" /> Clear all
          </motion.button>
        </motion.div>

        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <div className="min-w-[600px]">
            <table className="w-full border-separate border-spacing-0">
              {/* Property cards header */}
              <thead>
                <tr>
                  <th className="w-28 sm:w-36 pb-4 pr-3 text-left align-bottom">
                    <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Property</span>
                  </th>
                  {properties.map((p, i) => (
                    <th key={p._id} className="pb-4 px-2 align-bottom">
                      <motion.div
                        initial={{ opacity: 0, y: -16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08, duration: 0.4 }}
                        className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-sm border border-zinc-100 dark:border-zinc-800"
                      >
                        <div className="relative h-28 sm:h-36">
                          <Image
                            src={p.images[0] || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400"}
                            alt={p.title}
                            fill
                            className="object-cover"
                          />
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => remove(p._id)}
                            className="absolute top-2 right-2 w-6 h-6 bg-white/90 dark:bg-zinc-800/90 rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
                          >
                            <X className="w-3 h-3 text-zinc-700 dark:text-zinc-300" />
                          </motion.button>
                        </div>
                        <div className="p-3 text-left">
                          <Link
                            href={`/properties/${p._id}`}
                            className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-white hover:text-rose-500 transition-colors line-clamp-2"
                          >
                            {p.title}
                          </Link>
                          <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            {p.location.city}, {p.location.country}
                          </p>
                        </div>
                      </motion.div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {/* Data rows */}
                {rows.map((row, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.04 }}
                    className={cn(
                      i % 2 === 0
                        ? "bg-white dark:bg-zinc-900"
                        : "bg-zinc-50/80 dark:bg-zinc-800/40"
                    )}
                  >
                    <td className="py-3 pr-3 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium rounded-l-xl pl-3 whitespace-nowrap">
                      {row.label}
                    </td>
                    {properties.map((p) => (
                      <td
                        key={p._id}
                        className="py-3 px-2 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 text-center last:rounded-r-xl"
                      >
                        {row.render(p)}
                      </td>
                    ))}
                  </motion.tr>
                ))}

                {/* Amenities section */}
                <tr>
                  <td colSpan={properties.length + 1} className="pt-8 pb-3">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2"
                    >
                      <span className="w-1 h-4 bg-rose-500 rounded-full inline-block" />
                      Amenities
                    </motion.p>
                  </td>
                </tr>

                <motion.div
                  variants={stagger}
                  initial="hidden"
                  animate="show"
                  className="contents"
                >
                  {ALL_AMENITIES.map((amenity) => (
                    <motion.tr
                      key={amenity}
                      variants={fadeUp}
                      className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="py-2.5 pr-3 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 pl-3">{amenity}</td>
                      {properties.map((p) => (
                        <td key={p._id} className="py-2.5 px-2 text-center">
                          <AnimatePresence mode="wait">
                            {p.amenities.some((a) => a.toLowerCase().includes(amenity.toLowerCase())) ? (
                              <motion.div
                                key="check"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                              >
                                <Check className="w-4 h-4 text-green-500 mx-auto" />
                              </motion.div>
                            ) : (
                              <motion.div key="minus" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <Minus className="w-4 h-4 text-zinc-300 dark:text-zinc-600 mx-auto" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </motion.div>

                {/* CTA row */}
                <tr>
                  <td className="pt-6" />
                  {properties.map((p, i) => (
                    <td key={p._id} className="pt-6 px-2">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + i * 0.08 }}
                      >
                        <Link href={`/properties/${p._id}`}>
                          <Button size="sm" className="w-full text-xs">
                            View Property
                          </Button>
                        </Link>
                      </motion.div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
