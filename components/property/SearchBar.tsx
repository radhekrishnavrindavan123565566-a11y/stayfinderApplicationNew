"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, DollarSign, Home, SlidersHorizontal, X } from "lucide-react";
import { usePropertyStore } from "@/store/propertyStore";
import { useDebounce } from "@/hooks/useDebounce";
import { useEffect } from "react";
import Button from "@/components/ui/Button";

const PROPERTY_TYPES = ["apartment", "house", "villa", "studio", "condo", "cabin"];

export default function SearchBar({ compact = false }: { compact?: boolean }) {
  const { filters, setFilters, fetchProperties } = usePropertyStore();
  const [showFilters, setShowFilters] = useState(false);
  const [localSearch, setLocalSearch] = useState(filters.search);
  const debouncedSearch = useDebounce(localSearch, 400);

  useEffect(() => {
    setFilters({ search: debouncedSearch });
  }, [debouncedSearch, setFilters]);

  const handleSearch = () => {
    fetchProperties(1);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({ search: "", city: "", minPrice: "", maxPrice: "", propertyType: "", bedrooms: "" });
    setLocalSearch("");
    fetchProperties(1);
  };

  if (compact) {
    return (
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search properties..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
        <Button onClick={handleSearch} size="sm">Search</Button>
        <Button onClick={() => setShowFilters(!showFilters)} variant="outline" size="sm">
          <SlidersHorizontal className="w-4 h-4" />
        </Button>
        {showFilters && <FilterPanel filters={filters} setFilters={setFilters} onApply={handleSearch} onClear={clearFilters} />}
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl p-2 flex flex-col sm:flex-row gap-2"
      >
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-zinc-50 transition-colors">
          <Search className="w-5 h-5 text-rose-400 shrink-0" />
          <input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search destinations, properties..."
            className="flex-1 bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-zinc-50 transition-colors border-l border-zinc-100">
          <MapPin className="w-5 h-5 text-rose-400 shrink-0" />
          <input
            value={filters.city}
            onChange={(e) => setFilters({ city: e.target.value })}
            placeholder="City"
            className="w-28 bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowFilters(!showFilters)} variant="ghost" size="sm" className="gap-1">
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </Button>
          <Button onClick={handleSearch} size="md" className="rounded-xl">
            <Search className="w-4 h-4" /> Search
          </Button>
        </div>
      </motion.div>

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 bg-white rounded-2xl shadow-xl p-5 border border-zinc-100"
        >
          <FilterPanel filters={filters} setFilters={setFilters} onApply={handleSearch} onClear={clearFilters} />
        </motion.div>
      )}
    </div>
  );
}

function FilterPanel({ filters, setFilters, onApply, onClear }: {
  filters: ReturnType<typeof usePropertyStore.getState>["filters"];
  setFilters: (f: Partial<typeof filters>) => void;
  onApply: () => void;
  onClear: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className="text-xs font-medium text-zinc-600 mb-1 block">Min Price</label>
          <div className="relative">
            <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) => setFilters({ minPrice: e.target.value })}
              placeholder="0"
              className="w-full pl-7 pr-3 py-2 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600 mb-1 block">Max Price</label>
          <div className="relative">
            <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ maxPrice: e.target.value })}
              placeholder="Any"
              className="w-full pl-7 pr-3 py-2 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600 mb-1 block">Property Type</label>
          <div className="relative">
            <Home className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <select
              value={filters.propertyType}
              onChange={(e) => setFilters({ propertyType: e.target.value })}
              className="w-full pl-7 pr-3 py-2 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
            >
              <option value="">All Types</option>
              {PROPERTY_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600 mb-1 block">Min Bedrooms</label>
          <select
            value={filters.bedrooms}
            onChange={(e) => setFilters({ bedrooms: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
          >
            <option value="">Any</option>
            {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button onClick={onClear} variant="ghost" size="sm"><X className="w-3.5 h-3.5" /> Clear</Button>
        <Button onClick={onApply} size="sm">Apply Filters</Button>
      </div>
    </div>
  );
}
