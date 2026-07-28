"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share2, Download } from "lucide-react";
import axios from "axios";
import { useApi } from "@/hooks/useApi";
import Badge from "@/components/ui/Badge";
import toast from "react-hot-toast";

interface ComparisonProperty {
  _id: string;
  title: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  location: { city: string; address: string };
  averageRating: number;
  images: string[];
}

interface PropertyComparisonProps {
  currentPropertyId: string;
}

export default function PropertyComparison({ currentPropertyId }: PropertyComparisonProps) {
  const [compareList, setCompareList] = useState<ComparisonProperty[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { authHeaders } = useApi();

  // Load comparison list from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("propertyComparison");
    if (stored) {
      setCompareList(JSON.parse(stored));
    }
  }, []);

  // Save to localStorage whenever list changes
  useEffect(() => {
    localStorage.setItem("propertyComparison", JSON.stringify(compareList));
  }, [compareList]);

  const addToComparison = async (propertyId: string) => {
    if (compareList.length >= 5) {
      toast.error("Maximum 5 properties in comparison");
      return;
    }
    if (compareList.find((p) => p._id === propertyId)) {
      toast.error("Already in comparison");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.get(`/api/properties/${propertyId}`, authHeaders());
      const property = data.data.property;
      setCompareList([
        ...compareList,
        {
          _id: property._id,
          title: property.title,
          price: property.price,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          amenities: property.amenities,
          location: property.location,
          averageRating: property.averageRating,
          images: property.images,
        },
      ]);
      toast.success("Added to comparison");
    } catch {
      toast.error("Failed to add property");
    } finally {
      setLoading(false);
    }
  };

  const removeFromComparison = (propertyId: string) => {
    setCompareList(compareList.filter((p) => p._id !== propertyId));
  };

  const clearComparison = () => {
    setCompareList([]);
    toast.success("Comparison cleared");
  };

  const getCommonAmenities = (props: ComparisonProperty[]) => {
    if (props.length === 0) return [];
    const sets = props.map((p) => new Set(p.amenities));
    return Array.from(sets[0]).filter((amenity) =>
      sets.every((set) => set.has(amenity))
    );
  };

  const shareComparison = async () => {
    const ids = compareList.map((p) => p._id).join(",");
    const url = `${window.location.origin}/properties?compare=${ids}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Comparison link copied!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const downloadPDF = () => {
    // Simple PDF generation - can be enhanced with a library like jsPDF
    const content = compareList
      .map(
        (p) =>
          `${p.title}\nPrice: ₹${p.price}/month\nBedrooms: ${p.bedrooms}, Bathrooms: ${p.bathrooms}\nLocation: ${p.location.city}\nRating: ${p.averageRating}⭐\n---\n`
      )
      .join("\n");

    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(content));
    element.setAttribute("download", "property-comparison.txt");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-4">
      {/* Add button */}
      <motion.button
        onClick={() => addToComparison(currentPropertyId)}
        disabled={loading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full px-4 py-3 rounded-xl font-semibold transition-colors bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? "Adding..." : "Add to Comparison"}
        {compareList.length > 0 && (
          <Badge variant="default" className="bg-white/20 text-white text-xs">
            {compareList.length}/5
          </Badge>
        )}
      </motion.button>

      {/* Comparison modal */}
      <AnimatePresence>
        {compareList.length > 0 && (
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            whileHover={{ scale: 1.02 }}
            className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold"
          >
            View Comparison ({compareList.length})
          </motion.button>
        )}
      </AnimatePresence>

      {/* Comparison Panel */}
      <AnimatePresence>
        {isOpen && compareList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-zinc-900 rounded-2xl max-h-[80vh] overflow-auto w-full max-w-4xl space-y-4 p-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                  Compare Properties
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Comparison Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800">
                      <th className="text-left py-3 px-2 font-semibold text-zinc-700 dark:text-zinc-300">
                        Property
                      </th>
                      {compareList.map((prop) => (
                        <th key={prop._id} className="text-left py-3 px-2 font-semibold text-zinc-700 dark:text-zinc-300 min-w-40">
                          <div className="flex flex-col gap-1">
                            <span className="truncate">{prop.title}</span>
                            <button
                              onClick={() => removeFromComparison(prop._id)}
                              className="text-xs text-red-500 hover:text-red-600 w-fit"
                            >
                              Remove
                            </button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800">
                      <td className="py-3 px-2 font-semibold text-zinc-900 dark:text-white">
                        Price/Month
                      </td>
                      {compareList.map((prop) => (
                        <td key={prop._id} className="py-3 px-2 text-zinc-700 dark:text-zinc-300">
                          ₹{prop.price.toLocaleString("en-IN")}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800">
                      <td className="py-3 px-2 font-semibold text-zinc-900 dark:text-white">
                        Bedrooms
                      </td>
                      {compareList.map((prop) => (
                        <td key={prop._id} className="py-3 px-2 text-zinc-700 dark:text-zinc-300">
                          {prop.bedrooms}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800">
                      <td className="py-3 px-2 font-semibold text-zinc-900 dark:text-white">
                        Bathrooms
                      </td>
                      {compareList.map((prop) => (
                        <td key={prop._id} className="py-3 px-2 text-zinc-700 dark:text-zinc-300">
                          {prop.bathrooms}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800">
                      <td className="py-3 px-2 font-semibold text-zinc-900 dark:text-white">
                        Location
                      </td>
                      {compareList.map((prop) => (
                        <td key={prop._id} className="py-3 px-2 text-zinc-700 dark:text-zinc-300 text-xs">
                          {prop.location.city}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800">
                      <td className="py-3 px-2 font-semibold text-zinc-900 dark:text-white">
                        Rating
                      </td>
                      {compareList.map((prop) => (
                        <td key={prop._id} className="py-3 px-2 text-zinc-700 dark:text-zinc-300">
                          {prop.averageRating > 0 ? `${prop.averageRating.toFixed(1)}⭐` : "N/A"}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-2 font-semibold text-zinc-900 dark:text-white">
                        Amenities
                      </td>
                      {compareList.map((prop) => (
                        <td key={prop._id} className="py-3 px-2 text-xs">
                          <div className="flex flex-wrap gap-1">
                            {prop.amenities.slice(0, 3).map((a) => (
                              <Badge key={a} variant="info" className="text-xs">
                                {a}
                              </Badge>
                            ))}
                            {prop.amenities.length > 3 && (
                              <Badge variant="default" className="text-xs">
                                +{prop.amenities.length - 3}
                              </Badge>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Common amenities */}
              {compareList.length > 1 && (
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white mb-2">
                    Common Amenities
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {getCommonAmenities(compareList).length > 0 ? (
                      getCommonAmenities(compareList).map((a) => (
                        <Badge key={a} variant="success" className="text-xs">
                          ✓ {a}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-xs text-zinc-500">No common amenities</p>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={shareComparison}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
                >
                  <Share2 className="w-4 h-4" /> Share
                </button>
                <button
                  onClick={downloadPDF}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium transition-colors"
                >
                  <Download className="w-4 h-4" /> Export
                </button>
                <button
                  onClick={clearComparison}
                  className="ml-auto px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
                >
                  Clear All
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
