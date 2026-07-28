"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import { useApi } from "@/hooks/useApi";
import BackButton from "@/components/ui/BackButton";
import FloorPlanUploader from "@/components/properties/FloorPlanUploader";
import { Loader } from "lucide-react";

interface PropertyData {
  _id: string;
  title: string;
  description: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  propertyType: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    lat?: number;
    lng?: number;
  };
  floorPlan?: {
    imageUrl?: string;
    totalArea?: number;
    rooms?: Array<{ name: string; area: number; unit: "sqm" | "sqft" }>;
  };
  area: number;
  amenities: string[];
}

export default function PropertyEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { authHeaders } = useApi();
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [floorPlan, setFloorPlan] = useState<PropertyData["floorPlan"]>();

  useEffect(() => {
    const loadProperty = async () => {
      try {
        const { data } = await axios.get(`/api/properties/${id}`, authHeaders());
        const prop = data.data.property;
        setProperty(prop);
        setFloorPlan(prop.floorPlan);
      } catch {
        toast.error("Failed to load property");
      } finally {
        setLoading(false);
      }
    };

    if (id) loadProperty();
  }, [id, authHeaders]);

  const handleSave = async () => {
    if (!property) return;

    setSaving(true);
    try {
      await axios.patch(
        `/api/properties/${id}`,
        {
          ...property,
          floorPlan,
        },
        authHeaders()
      );

      toast.success("Property updated successfully");
      router.push(`/properties/${id}`);
    } catch (error) {
      toast.error("Failed to update property");
    } finally {
      setSaving(false);
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

  if (!property) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <p className="text-zinc-500 dark:text-zinc-400">Property not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16 bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center gap-3"
        >
          <BackButton />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
              Edit Property
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {property.title}
            </p>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Basic Info */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 space-y-4">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              Basic Information
            </h2>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={property.title}
                onChange={(e) =>
                  setProperty({ ...property, title: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                Description
              </label>
              <textarea
                value={property.description}
                onChange={(e) =>
                  setProperty({ ...property, description: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Price / Month (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={property.price}
                  onChange={(e) =>
                    setProperty({ ...property, price: Number(e.target.value) })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Total Area
                </label>
                <input
                  type="number"
                  min="0"
                  value={property.area}
                  onChange={(e) =>
                    setProperty({ ...property, area: Number(e.target.value) })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Bedrooms
                </label>
                <input
                  type="number"
                  min="0"
                  value={property.bedrooms}
                  onChange={(e) =>
                    setProperty({
                      ...property,
                      bedrooms: Number(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Bathrooms
                </label>
                <input
                  type="number"
                  min="0"
                  value={property.bathrooms}
                  onChange={(e) =>
                    setProperty({
                      ...property,
                      bathrooms: Number(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Property Type
                </label>
                <select
                  value={property.propertyType}
                  onChange={(e) =>
                    setProperty({ ...property, propertyType: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option>apartment</option>
                  <option>house</option>
                  <option>villa</option>
                  <option>studio</option>
                  <option>condo</option>
                  <option>cabin</option>
                </select>
              </div>
            </div>
          </div>

          {/* Floor Plan */}
          <FloorPlanUploader
            value={floorPlan}
            onChange={setFloorPlan}
            propertyId={property._id}
          />

          {/* Location */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 space-y-4">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              Location
            </h2>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                Address
              </label>
              <input
                type="text"
                value={property.location.address}
                onChange={(e) =>
                  setProperty({
                    ...property,
                    location: {
                      ...property.location,
                      address: e.target.value,
                    },
                  })
                }
                className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={property.location.city}
                  onChange={(e) =>
                    setProperty({
                      ...property,
                      location: {
                        ...property.location,
                        city: e.target.value,
                      },
                    })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  State
                </label>
                <input
                  type="text"
                  value={property.location.state}
                  onChange={(e) =>
                    setProperty({
                      ...property,
                      location: {
                        ...property.location,
                        state: e.target.value,
                      },
                    })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 sticky bottom-0 bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => router.back()}
              className="flex-1 px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-white font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <motion.button
              onClick={handleSave}
              disabled={saving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-4 py-3 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving && <Loader className="w-4 h-4 animate-spin" />}
              {saving ? "Saving..." : "Save Changes"}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
