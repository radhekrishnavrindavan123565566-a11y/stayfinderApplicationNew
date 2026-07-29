"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import axios from "axios";
import { Download, Share2, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import BackButton from "@/components/ui/BackButton";
import Badge from "@/components/ui/Badge";

interface ComparisonProperty {
  _id: string;
  title: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area?: number;
  amenities: string[];
  location: { city: string; address: string };
  averageRating: number;
  images: string[];
  propertyType: string;
}

function ComparisonPageContent() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<ComparisonProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const compareIds = searchParams.get("compare")?.split(",") || [];

  useEffect(() => {
    const loadProperties = async () => {
      if (compareIds.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const props = await Promise.all(
          compareIds.map((id) =>
            axios
              .get(`/api/properties/${id}`)
              .then((res) => res.data.data.property)
              .catch(() => null)
          )
        );

        setProperties(props.filter(Boolean));
      } catch {
        // Handle error silently
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, [compareIds]);

  const downloadComparison = () => {
    const csv = [
      ["Property", "Price/Month", "Bedrooms", "Bathrooms", "Location", "Rating"],
      ...properties.map((p) => [
        p.title,
        `₹${p.price.toLocaleString("en-IN")}`,
        p.bedrooms,
        p.bathrooms,
        p.location.city,
        p.averageRating > 0 ? p.averageRating.toFixed(1) : "N/A",
      ]),
    ];

    const csvContent = csv.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent)
    );
    element.setAttribute("download", "property-comparison.csv");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const shareComparison = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      alert("Comparison link copied to clipboard!");
    } catch {
      alert("Failed to copy link");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="min-h-screen pt-20 pb-16 bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-8"
          >
            <BackButton />
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
              Property Comparison
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800"
          >
            <p className="text-zinc-500 dark:text-zinc-400 mb-4">No properties to compare</p>
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-xl transition-colors"
            >
              Browse Properties <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16 bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <BackButton />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
                Property Comparison
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Comparing {properties.length} properties
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={shareComparison}
              className="p-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
              title="Share comparison"
            >
              <Share2 className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={downloadComparison}
              className="p-3 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors"
              title="Download as CSV"
            >
              <Download className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((prop, idx) => (
            <motion.div
              key={prop._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Image */}
              <div className="relative w-full h-48 bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                {prop.images[0] ? (
                  <Image
                    src={prop.images[0]}
                    alt={prop.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400">
                    No image
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge variant="info" className="capitalize text-xs">
                    {prop.propertyType}
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                {/* Title */}
                <div>
                  <h3 className="font-bold text-zinc-900 dark:text-white line-clamp-2">
                    {prop.title}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    {prop.location.city}
                  </p>
                </div>

                {/* Price */}
                <div className="py-3 border-t border-b border-zinc-100 dark:border-zinc-800">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
                    Price
                  </p>
                  <p className="text-2xl font-bold text-rose-500">
                    ₹{(prop.price / 1000).toFixed(0)}k
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">per month</p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-center">
                    <p className="text-lg font-bold text-zinc-900 dark:text-white">
                      {prop.bedrooms}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Bed</p>
                  </div>
                  <div className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-center">
                    <p className="text-lg font-bold text-zinc-900 dark:text-white">
                      {prop.bathrooms}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Bath</p>
                  </div>
                  <div className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-center">
                    <p className="text-lg font-bold text-zinc-900 dark:text-white">
                      {prop.area || "—"}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">sqm</p>
                  </div>
                </div>

                {/* Rating */}
                {prop.averageRating > 0 && (
                  <div className="p-2 bg-amber-50 dark:bg-amber-950/20 rounded-lg flex items-center justify-center gap-1">
                    <span>⭐</span>
                    <span className="font-bold text-amber-900 dark:text-amber-300">
                      {prop.averageRating.toFixed(1)}
                    </span>
                  </div>
                )}

                {/* Amenities */}
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase">
                    Amenities
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {prop.amenities.slice(0, 3).map((a) => (
                      <Badge key={a} variant="default" className="text-xs">
                        {a}
                      </Badge>
                    ))}
                    {prop.amenities.length > 3 && (
                      <Badge variant="default" className="text-xs">
                        +{prop.amenities.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* CTA */}
                <Link
                  href={`/properties/${prop._id}`}
                  className="w-full py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-medium text-sm transition-colors mt-4"
                >
                  View Details
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ComparisonPageLoader() {
  return (
    <div className="min-h-screen pt-20 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full"
      />
    </div>
  );
}

export default function ComparisonPage() {
  return (
    <Suspense fallback={<ComparisonPageLoader />}>
      <ComparisonPageContent />
    </Suspense>
  );
}
