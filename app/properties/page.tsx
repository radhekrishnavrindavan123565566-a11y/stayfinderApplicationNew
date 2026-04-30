"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { usePropertyStore } from "@/store/propertyStore";
import PropertyCard from "@/components/property/PropertyCard";
import SearchBar from "@/components/property/SearchBar";
import AISearchBar from "@/components/search/AISearchBar";
import { SkeletonGrid } from "@/components/ui/SkeletonCard";
import Button from "@/components/ui/Button";
import { ChevronLeft, ChevronRight, SlidersHorizontal, LayoutGrid, Map } from "lucide-react";
import SaveSearchButton from "@/components/properties/SaveSearchButton";
import CompareBar from "@/components/property/CompareBar";
import dynamic from "next/dynamic";

const PropertyMap = dynamic(() => import("@/components/property/PropertyMap"), { ssr: false });

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function PropertiesPage() {
  const { properties, isLoading, total, page, pages, fetchProperties } = usePropertyStore();
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  useEffect(() => {
    setMounted(true);
    fetchProperties(1);
  }, [fetchProperties]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-20">
      {/* Sticky search header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 sticky top-16 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 space-y-3">
          <AISearchBar />
          <SearchBar compact />
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {/* Header row */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
          className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
              {isLoading ? "Loading..." : `${total} Properties Found`}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Page {page} of {pages}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl p-1">
              <button onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-rose-500 text-white" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}>
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode("map")}
                className={`p-2 rounded-lg transition-colors ${viewMode === "map" ? "bg-rose-500 text-white" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}>
                <Map className="w-4 h-4" />
              </button>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400">
              <SlidersHorizontal className="w-4 h-4" />
              <span>Sort: Newest</span>
            </div>
          </div>
        </motion.div>

        {/* Map View */}
        <AnimatePresence mode="wait">
          {viewMode === "map" ? (
            <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="h-[50vh] sm:h-[600px] mb-8">
              {isLoading ? (
                <div className="w-full h-full rounded-2xl bg-zinc-200 dark:bg-zinc-800 animate-pulse flex items-center justify-center">
                  <Map className="w-10 h-10 text-zinc-400" />
                </div>
              ) : (
                <PropertyMap key={properties.map(p => p._id).join()} properties={properties} />
              )}
            </motion.div>
          ) : isLoading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SkeletonGrid count={12} />
            </motion.div>
          ) : properties.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="text-center py-24">
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="text-6xl mb-4">🏠</motion.div>
              <h3 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300 mb-2">No properties found</h3>
              <p className="text-zinc-500 dark:text-zinc-400">Try adjusting your filters or search terms</p>
            </motion.div>
          ) : (
            <motion.div key={`page-${page}`} variants={stagger} initial="hidden" animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
              {(properties ?? []).map((p, i) => (
                <motion.div key={p._id} variants={fadeUp}>
                  <PropertyCard property={p} index={i} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination — grid only */}
        {viewMode === "grid" && pages > 1 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-2 mt-10 flex-wrap">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => fetchProperties(page - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <Button key={p} size="sm" variant={p === page ? "primary" : "ghost"} onClick={() => fetchProperties(p)}>{p}</Button>
            ))}
            <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => fetchProperties(page + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </div>
      <CompareBar />
    </div>
  );
}
