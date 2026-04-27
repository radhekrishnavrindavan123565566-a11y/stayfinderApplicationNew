"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { usePropertyStore } from "@/store/propertyStore";
import PropertyCard from "@/components/property/PropertyCard";
import AdvancedFilters from "@/components/search/AdvancedFilters";
import LiveActivityFeed from "@/components/activity/LiveActivityFeed";
import { LayoutGrid, TrendingUp } from "lucide-react";

export default function EnhancedPropertiesPage() {
  const { properties, isLoading, fetchProperties } = usePropertyStore();
  const [filters, setFilters] = useState<any>({});

  useEffect(() => {
    fetchProperties(1);
  }, [fetchProperties]);

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
    // Apply filters to property search
    console.log("Applying filters:", newFilters);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">
            Find Your Perfect Home
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Discover properties with advanced filters and real-time activity
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <AdvancedFilters onApply={handleApplyFilters} initialFilters={filters} />
            </motion.div>

            {/* Live Activity */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <LiveActivityFeed />
            </motion.div>

            {/* Trending Properties */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800"
            >
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                <h3 className="font-semibold text-zinc-900 dark:text-white">
                  Trending Now
                </h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">
                    Near IIT Kanpur
                  </p>
                  <p className="text-xs text-zinc-500">+45% searches</p>
                </div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">
                    Women-Only PG
                  </p>
                  <p className="text-xs text-zinc-500">+32% searches</p>
                </div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">
                    WiFi + AC
                  </p>
                  <p className="text-xs text-zinc-500">+28% searches</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-between mb-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {properties.length} Properties Found
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Showing results for your search
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm">
                  <option>Recommended</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest First</option>
                  <option>Most Popular</option>
                </select>
              </div>
            </motion.div>

            {/* Properties Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded-2xl h-96"
                  />
                ))}
              </div>
            ) : properties.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-zinc-900 rounded-2xl p-12 text-center border border-zinc-200 dark:border-zinc-800"
              >
                <div className="bg-zinc-100 dark:bg-zinc-800 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <LayoutGrid className="w-10 h-10 text-zinc-400" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
                  No properties found
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                  Try adjusting your filters to see more results
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {properties.map((property, index) => (
                  <motion.div
                    key={property._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <PropertyCard property={property} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
