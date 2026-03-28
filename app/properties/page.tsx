"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePropertyStore } from "@/store/propertyStore";
import PropertyCard from "@/components/property/PropertyCard";
import SearchBar from "@/components/property/SearchBar";
import { SkeletonGrid } from "@/components/ui/SkeletonCard";
import Button from "@/components/ui/Button";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import CompareBar from "@/components/property/CompareBar";
import AISearchBar from "@/components/search/AISearchBar";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function PropertiesPage() {
  const { properties, isLoading, total, page, pages, fetchProperties } = usePropertyStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchProperties(1);
  }, [fetchProperties]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-20">
      {/* Sticky search header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 sticky top-16 z-30 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 space-y-3">
          <AISearchBar />
          <SearchBar compact />
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {/* Header row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
              {isLoading ? "Loading..." : `${total} Properties Found`}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              Page {page} of {pages}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Sort: Newest</span>
          </div>
        </motion.div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SkeletonGrid count={12} />
            </motion.div>
          ) : properties.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-24"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="text-6xl mb-4"
              >
                🏠
              </motion.div>
              <h3 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300 mb-2">No properties found</h3>
              <p className="text-zinc-500 dark:text-zinc-400">Try adjusting your filters or search terms</p>
            </motion.div>
          ) : (
            <motion.div
              key={`page-${page}`}
              variants={stagger}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6"
            >
              {properties.map((p, i) => (
                <motion.div key={p._id} variants={fadeUp}>
                  <PropertyCard property={p} index={i} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {pages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-2 mt-10 flex-wrap"
          >
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => fetchProperties(page - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                size="sm"
                variant={p === page ? "primary" : "ghost"}
                onClick={() => fetchProperties(p)}
              >
                {p}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pages}
              onClick={() => fetchProperties(page + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </div>
      <CompareBar />
    </div>
  );
}
