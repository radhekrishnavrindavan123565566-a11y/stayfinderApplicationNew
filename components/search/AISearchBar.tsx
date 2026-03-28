"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Search, Loader2, X } from "lucide-react";
import axios from "axios";
import { usePropertyStore } from "@/store/propertyStore";
import toast from "react-hot-toast";

export default function AISearchBar() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsedFilters, setParsedFilters] = useState<Record<string, unknown> | null>(null);
  const { fetchProperties, setFilters } = usePropertyStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const { data } = await axios.post("/api/ai/search", { query });
      const filters = data.data.filters;
      setParsedFilters(filters);
      // Set filters in store then fetch
      setFilters({
        city: filters.city || "",
        minPrice: filters.minPrice ? String(filters.minPrice) : "",
        maxPrice: filters.maxPrice ? String(filters.maxPrice) : "",
        bedrooms: filters.bedrooms ? String(filters.bedrooms) : "",
        propertyType: filters.propertyType || "",
        search: filters.keywords || "",
      });
      fetchProperties(1);
    } catch {
      toast.error("AI search failed, try again");
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setQuery("");
    setParsedFilters(null);
    setFilters({ city: "", minPrice: "", maxPrice: "", bedrooms: "", propertyType: "", search: "" });
    fetchProperties(1);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm px-4 py-3 focus-within:ring-2 focus-within:ring-rose-400 transition-all">
          <Sparkles className="w-5 h-5 text-rose-500 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="Describe your ideal home... e.g. 2-bedroom apartment in NYC under $150/night with WiFi"
            className="flex-1 bg-transparent text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none"
          />
          {query && (
            <button onClick={clear} className="text-zinc-400 hover:text-zinc-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={search}
            disabled={loading || !query.trim()}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? "Searching..." : "Search"}
          </motion.button>
        </div>

        <AnimatePresence>
          {parsedFilters && Object.keys(parsedFilters).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="mt-2 flex flex-wrap gap-1.5"
            >
              <span className="text-xs text-zinc-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-rose-400" /> AI extracted:
              </span>
              {Object.entries(parsedFilters).map(([k, v]) => (
                v && (
                  <span key={k} className="text-xs bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full capitalize">
                    {k}: {Array.isArray(v) ? v.join(", ") : String(v)}
                  </span>
                )
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
