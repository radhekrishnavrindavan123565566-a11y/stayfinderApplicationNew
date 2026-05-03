"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, DollarSign, Home, SlidersHorizontal, X, Bed, Bath, ArrowRight, Loader2 } from "lucide-react";
import { usePropertyStore, Property } from "@/store/propertyStore";
import { useDebounce } from "@/hooks/useDebounce";
import Button from "@/components/ui/Button";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { useTranslations } from "next-intl";

const PROPERTY_TYPES = ["apartment", "house", "villa", "studio", "condo", "cabin"];

/* ── inline quick-search results ── */
function QuickResults({
  results, loading, query, city, onClose,
}: {
  results: Property[]; loading: boolean; query: string; city: string; onClose: () => void;
}) {
  const t = useTranslations("search");
  const hasQuery = query.trim().length > 0 || city.trim().length > 0;
  if (!hasQuery) return null;

  const params = new URLSearchParams();
  if (query) params.set("search", query);
  if (city) params.set("city", city);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden z-[100]"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
          {loading ? t("searching") : t("resultsFound", { count: results.length, plural: results.length !== 1 ? "s" : "" })}
        </p>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
          <X className="w-3.5 h-3.5 text-zinc-400" />
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-10 gap-2 text-zinc-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">{t("findingProperties")}</span>
        </div>
      )}

      {/* No results */}
      {!loading && results.length === 0 && (
        <div className="text-center py-10">
          <div className="text-4xl mb-2">🏠</div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("noProperties")}</p>
          <p className="text-xs text-zinc-400 mt-1">{t("tryDifferent")}</p>
        </div>
      )}

      {/* Results list */}
      {!loading && results.length > 0 && (
        <div className="max-h-[420px] overflow-y-auto divide-y divide-zinc-50 dark:divide-zinc-800">
          {results.map((p, i) => {
            const img = p.images?.[0] || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=60";
            return (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  href={`/properties/${p._id}`}
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors group"
                >
                  {/* Thumbnail */}
                  <div className="relative w-16 h-12 rounded-xl overflow-hidden flex-shrink-0">
                    <Image src={img} alt={p.title} fill sizes="64px" className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate group-hover:text-rose-500 transition-colors">
                      {p.title}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-zinc-400 mt-0.5">
                      <MapPin className="w-3 h-3 text-rose-400 flex-shrink-0" />
                      <span className="truncate">{p.location.city}, {p.location.country}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-zinc-400">
                      <span className="flex items-center gap-1"><Bed className="w-3 h-3" />{p.bedrooms}</span>
                      <span className="flex items-center gap-1"><Bath className="w-3 h-3" />{p.bathrooms}</span>
                      <span className="capitalize bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md text-[10px] font-medium">{p.propertyType}</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">₹{p.price.toLocaleString("en-IN")}</p>
                    <p className="text-[10px] text-zinc-400">/month</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Footer — view all */}
      {!loading && results.length > 0 && (
        <div className="border-t border-zinc-100 dark:border-zinc-800 px-4 py-3">
          <Link href={`/properties?${params.toString()}`} onClick={onClose}
            className="flex items-center justify-center gap-2 text-sm font-semibold text-rose-500 hover:text-rose-600 transition-colors group"
          >
            {t("viewAll", { count: results.length })}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      )}
    </motion.div>
  );
}

/* ── main SearchBar ── */
export default function SearchBar({ compact = false }: { compact?: boolean }) {
  const t = useTranslations("search");
  const tBar = useTranslations("searchBar");
  const tHero = useTranslations("hero");
  const { filters, setFilters, fetchProperties } = usePropertyStore();
  const [showFilters, setShowFilters] = useState(false);
  const [localSearch, setLocalSearch] = useState(filters.search);
  const [localCity, setLocalCity] = useState(filters.city);
  const [quickResults, setQuickResults] = useState<Property[]>([]);
  const [quickLoading, setQuickLoading] = useState(false);
  const [showQuick, setShowQuick] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebounce(localSearch, 350);
  const debouncedCity = useDebounce(localCity, 350);

  // Fetch quick results whenever debounced query changes
  useEffect(() => {
    const hasQuery = debouncedSearch.trim() || debouncedCity.trim();
    if (!hasQuery) { setShowQuick(false); setQuickResults([]); return; }

    setQuickLoading(true);
    setShowQuick(true);
    const params = new URLSearchParams({ limit: "6" });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (debouncedCity) params.set("city", debouncedCity);

    axios.get(`/api/properties?${params}`)
      .then(({ data }) => setQuickResults(data.data.properties || []))
      .catch(() => setQuickResults([]))
      .finally(() => setQuickLoading(false));
  }, [debouncedSearch, debouncedCity]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowQuick(false);
        setShowFilters(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = useCallback(() => {
    setFilters({ search: localSearch, city: localCity });
    fetchProperties(1);
    setShowFilters(false);
    setShowQuick(false);
  }, [localSearch, localCity, setFilters, fetchProperties]);

  const clearFilters = () => {
    setFilters({ search: "", city: "", minPrice: "", maxPrice: "", propertyType: "", bedrooms: "", nearLocation: "" });
    setLocalSearch("");
    setLocalCity("");
    setQuickResults([]);
    setShowQuick(false);
    fetchProperties(1);
  };

  if (compact) {
    return (
      <div ref={wrapperRef} className="relative">
        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 p-1.5 shadow-sm">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder={tBar("compactPlaceholder")}
              className="w-full pl-9 pr-3 py-2 bg-transparent text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none"
            />
          </div>
          
          {/* Divider */}
          <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-700" />
          
          {/* Filter button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              showFilters ? "bg-rose-500 text-white" : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">{tBar("filters")}</span>
          </button>
          <button onClick={handleSearch}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">{tBar("search")}</span>
          </button>
        </div>
        
        {/* Quick results dropdown */}
        <AnimatePresence>
          {showQuick && (
            <QuickResults
              results={quickResults}
              loading={quickLoading}
              query={localSearch}
              city={localCity}
              onClose={() => setShowQuick(false)}
            />
          )}
        </AnimatePresence>
        
        {/* Filter panel dropdown */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-100 dark:border-zinc-800 p-5 z-[100]"
            >
              <FilterPanel filters={filters} setFilters={setFilters} onApply={handleSearch} onClear={clearFilters} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="relative w-full max-w-4xl mx-auto z-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-100 dark:border-zinc-800 p-2 flex flex-col sm:flex-row items-stretch gap-2 relative z-50"
      >
        {/* Search input */}
        <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
          <Search className="w-5 h-5 text-rose-500 shrink-0 group-hover:scale-110 transition-transform" />
          <div className="flex-1">
            <input
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              onFocus={() => (localSearch || localCity) && setShowQuick(true)}
              placeholder={tBar("searchPlaceholder")}
              className="w-full bg-transparent text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none"            />
          </div>
          {localSearch && (
            <button onClick={() => { setLocalSearch(""); setQuickResults([]); setShowQuick(false); }}
              className="p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
              <X className="w-4 h-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300" />
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px bg-zinc-200 dark:bg-zinc-700 my-2" />

        {/* City input */}
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group sm:w-48">
          <MapPin className="w-5 h-5 text-rose-500 shrink-0 group-hover:scale-110 transition-transform" />
          <input
            value={localCity}
            onChange={(e) => setLocalCity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            onFocus={() => (localSearch || localCity) && setShowQuick(true)}
            placeholder={tBar("cityPlaceholder")}
            className="flex-1 bg-transparent text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none"
          />
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px bg-zinc-200 dark:bg-zinc-700 my-2" />

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowFilters(!showFilters)} 
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              showFilters ? "bg-rose-500 text-white shadow-lg shadow-rose-500/25" : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden lg:inline">{tBar("filters")}</span>
          </button>
          <button onClick={handleSearch}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 transition-all"
          >
            <Search className="w-4 h-4" />
            <span>{tBar("search")}</span>
          </button>
        </div>
      </motion.div>

      {/* Quick results dropdown */}
      <AnimatePresence>
        {showQuick && (
          <QuickResults
            results={quickResults}
            loading={quickLoading}
            query={localSearch}
            city={localCity}
            onClose={() => setShowQuick(false)}
          />
        )}
      </AnimatePresence>

      {/* Advanced filters panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="mt-3 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-100 dark:border-zinc-800 p-5 z-[100]"
          >
            <FilterPanel filters={filters} setFilters={setFilters} onApply={handleSearch} onClear={clearFilters} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterPanel({ filters, setFilters, onApply, onClear }: {
  filters: ReturnType<typeof usePropertyStore.getState>["filters"];
  setFilters: (f: Partial<typeof filters>) => void;
  onApply: () => void;
  onClear: () => void;
}) {
  const t = useTranslations("searchBar");
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">{t("advancedFilters")}</h3>
      </div>
      <div>
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1 block flex items-center gap-1">
          🎓 {t("nearCollege")}
        </label>
        <input value={filters.nearLocation} onChange={(e) => setFilters({ nearLocation: e.target.value })}
          placeholder={t("nearPlaceholder")}
          className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1 block">{t("minPrice")}</label>
          <div className="relative">
            <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input type="number" value={filters.minPrice} onChange={(e) => setFilters({ minPrice: e.target.value })}
              placeholder="0" className="w-full pl-7 pr-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1 block">{t("maxPrice")}</label>
          <div className="relative">
            <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input type="number" value={filters.maxPrice} onChange={(e) => setFilters({ maxPrice: e.target.value })}
              placeholder={t("any")} className="w-full pl-7 pr-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1 block">{t("propertyType")}</label>
          <div className="relative">
            <Home className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <select value={filters.propertyType} onChange={(e) => setFilters({ propertyType: e.target.value })}
              className="w-full pl-7 pr-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white">
              <option value="">{t("allTypes")}</option>
              {PROPERTY_TYPES.map((pt) => <option key={pt} value={pt} className="capitalize">{pt}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1 block">{t("minBedrooms")}</label>
          <select value={filters.bedrooms} onChange={(e) => setFilters({ bedrooms: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white">
            <option value="">{t("any")}</option>
            {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <Button onClick={onClear} variant="ghost" size="sm"><X className="w-3.5 h-3.5" /> {t("clear")}</Button>
        <Button onClick={onApply} size="sm">{t("applyFilters")}</Button>
      </div>
    </div>
  );
}
