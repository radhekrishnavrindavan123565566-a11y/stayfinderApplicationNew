"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  SlidersHorizontal,
  X,
  MapPin,
  DollarSign,
  Home,
  Users,
  Wifi,
  Car,
  Utensils,
  Shield,
  Zap,
  GraduationCap,
  Briefcase,
} from "lucide-react";
import { cn } from "@/utils/cn";

interface FilterState {
  priceRange: [number, number];
  propertyTypes: string[];
  bedrooms: number[];
  amenities: string[];
  distanceFromCollege?: number;
  collegeName?: string;
  foodPreference?: string;
  gender?: string;
  securityFeatures: string[];
}

interface AdvancedFiltersProps {
  onApply: (filters: FilterState) => void;
  initialFilters?: Partial<FilterState>;
}

export default function AdvancedFilters({
  onApply,
  initialFilters = {},
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    priceRange: initialFilters.priceRange || [0, 50000],
    propertyTypes: initialFilters.propertyTypes || [],
    bedrooms: initialFilters.bedrooms || [],
    amenities: initialFilters.amenities || [],
    distanceFromCollege: initialFilters.distanceFromCollege,
    collegeName: initialFilters.collegeName,
    foodPreference: initialFilters.foodPreference,
    gender: initialFilters.gender,
    securityFeatures: initialFilters.securityFeatures || [],
  });

  const propertyTypes = [
    { id: "apartment", label: "Apartment", icon: Home },
    { id: "house", label: "House", icon: Home },
    { id: "villa", label: "Villa", icon: Home },
    { id: "studio", label: "Studio", icon: Home },
  ];

  const amenities = [
    { id: "wifi", label: "WiFi", icon: Wifi },
    { id: "parking", label: "Parking", icon: Car },
    { id: "kitchen", label: "Kitchen", icon: Utensils },
    { id: "ac", label: "AC", icon: Zap },
    { id: "laundry", label: "Laundry", icon: Home },
    { id: "gym", label: "Gym", icon: Users },
  ];

  const securityFeatures = [
    { id: "cctv", label: "CCTV", icon: Shield },
    { id: "security_guard", label: "Security Guard", icon: Shield },
    { id: "gated", label: "Gated Community", icon: Shield },
  ];

  const toggleArrayFilter = (key: keyof FilterState, value: string) => {
    setFilters((prev) => {
      const current = prev[key] as string[];
      return {
        ...prev,
        [key]: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      };
    });
  };

  const toggleNumberFilter = (key: keyof FilterState, value: number) => {
    setFilters((prev) => {
      const current = prev[key] as number[];
      return {
        ...prev,
        [key]: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      };
    });
  };

  const handleApply = () => {
    onApply(filters);
    setIsOpen(false);
  };

  const handleReset = () => {
    setFilters({
      priceRange: [0, 50000],
      propertyTypes: [],
      bedrooms: [],
      amenities: [],
      securityFeatures: [],
    });
  };

  const activeFiltersCount =
    filters.propertyTypes.length +
    filters.bedrooms.length +
    filters.amenities.length +
    filters.securityFeatures.length +
    (filters.collegeName ? 1 : 0) +
    (filters.foodPreference ? 1 : 0) +
    (filters.gender ? 1 : 0);

  return (
    <>
      {/* Filter Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="relative flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl hover:border-blue-500 transition-colors"
      >
        <SlidersHorizontal className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
        <span className="font-medium text-zinc-900 dark:text-white">Filters</span>
        {activeFiltersCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
          >
            {activeFiltersCount}
          </motion.span>
        )}
      </motion.button>

      {/* Filter Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] bg-white dark:bg-zinc-900 shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                  Advanced Filters
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <X className="w-6 h-6 text-zinc-700 dark:text-zinc-300" />
                </motion.button>
              </div>

              {/* Filters Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Price Range */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white mb-3">
                    <DollarSign className="w-5 h-5" />
                    Price Range
                  </label>
                  <div className="space-y-3">
                    <input
                      type="range"
                      min="0"
                      max="100000"
                      step="1000"
                      value={filters.priceRange[1]}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          priceRange: [prev.priceRange[0], parseInt(e.target.value)],
                        }))
                      }
                      className="w-full accent-blue-500"
                    />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-600 dark:text-zinc-400">
                        ₹{filters.priceRange[0].toLocaleString()}
                      </span>
                      <span className="font-semibold text-zinc-900 dark:text-white">
                        ₹{filters.priceRange[1].toLocaleString()}
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Property Type */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white mb-3">
                    <Home className="w-5 h-5" />
                    Property Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {propertyTypes.map((type) => {
                      const Icon = type.icon;
                      const isSelected = filters.propertyTypes.includes(type.id);
                      return (
                        <motion.button
                          key={type.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleArrayFilter("propertyTypes", type.id)}
                          className={cn(
                            "flex items-center gap-2 p-3 rounded-xl border-2 transition-all",
                            isSelected
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                              : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
                          )}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{type.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Bedrooms */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white mb-3">
                    <Users className="w-5 h-5" />
                    Bedrooms
                  </label>
                  <div className="flex gap-3">
                    {[1, 2, 3, 4, 5].map((num) => {
                      const isSelected = filters.bedrooms.includes(num);
                      return (
                        <motion.button
                          key={num}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toggleNumberFilter("bedrooms", num)}
                          className={cn(
                            "w-12 h-12 rounded-xl border-2 font-semibold transition-all",
                            isSelected
                              ? "border-blue-500 bg-blue-500 text-white"
                              : "border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-blue-500"
                          )}
                        >
                          {num}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>

                {/* College/Office Distance */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white mb-3">
                    <GraduationCap className="w-5 h-5" />
                    Near College/Office
                  </label>
                  <input
                    type="text"
                    placeholder="Enter college or office name"
                    value={filters.collegeName || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, collegeName: e.target.value }))
                    }
                    className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white mb-3"
                  />
                  <div>
                    <label className="text-xs text-zinc-600 dark:text-zinc-400 mb-2 block">
                      Maximum Distance: {filters.distanceFromCollege || 5} km
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={filters.distanceFromCollege || 5}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          distanceFromCollege: parseInt(e.target.value),
                        }))
                      }
                      className="w-full accent-blue-500"
                    />
                  </div>
                </motion.div>

                {/* Amenities */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <label className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white mb-3">
                    <Zap className="w-5 h-5" />
                    Amenities
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {amenities.map((amenity) => {
                      const Icon = amenity.icon;
                      const isSelected = filters.amenities.includes(amenity.id);
                      return (
                        <motion.button
                          key={amenity.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleArrayFilter("amenities", amenity.id)}
                          className={cn(
                            "flex items-center gap-2 p-3 rounded-xl border-2 transition-all",
                            isSelected
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                              : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
                          )}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-sm font-medium">{amenity.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Security Features */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <label className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white mb-3">
                    <Shield className="w-5 h-5" />
                    Security Features
                  </label>
                  <div className="space-y-2">
                    {securityFeatures.map((feature) => {
                      const Icon = feature.icon;
                      const isSelected = filters.securityFeatures.includes(feature.id);
                      return (
                        <motion.button
                          key={feature.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => toggleArrayFilter("securityFeatures", feature.id)}
                          className={cn(
                            "w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all",
                            isSelected
                              ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                              : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
                          )}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{feature.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Food Preference */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <label className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white mb-3">
                    <Utensils className="w-5 h-5" />
                    Food Preference
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {["veg", "non-veg", "both"].map((pref) => {
                      const isSelected = filters.foodPreference === pref;
                      return (
                        <motion.button
                          key={pref}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            setFilters((prev) => ({ ...prev, foodPreference: pref }))
                          }
                          className={cn(
                            "p-3 rounded-xl border-2 font-medium capitalize transition-all",
                            isSelected
                              ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                              : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
                          )}
                        >
                          {pref}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Gender Preference */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <label className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white mb-3">
                    <Users className="w-5 h-5" />
                    Gender Preference
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {["male", "female", "any"].map((gender) => {
                      const isSelected = filters.gender === gender;
                      return (
                        <motion.button
                          key={gender}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setFilters((prev) => ({ ...prev, gender }))}
                          className={cn(
                            "p-3 rounded-xl border-2 font-medium capitalize transition-all",
                            isSelected
                              ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                              : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
                          )}
                        >
                          {gender}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleReset}
                  className="flex-1 py-3 rounded-xl border-2 border-zinc-300 dark:border-zinc-700 font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  Reset
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleApply}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 font-semibold text-white hover:shadow-lg transition-shadow"
                >
                  Apply Filters
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
