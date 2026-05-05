"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { usePreferencesStore } from "@/store/preferencesStore";
import PropertyCard from "@/components/property/PropertyCard";
import { Property } from "@/store/propertyStore";

export default function RecentlyViewed() {
  const { user, accessToken } = useAuthStore();
  const { preferences, fetchPreferences } = usePreferencesStore();
  const [properties, setProperties] = useState<Property[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recentlyViewed: { propertyId: string; viewedAt: string }[] = (preferences as any)?.recentlyViewed ?? [];

  useEffect(() => {
    if (user && !preferences) {
      fetchPreferences();
    }
  }, [user, preferences, fetchPreferences]);

  useEffect(() => {
    if (!recentlyViewed.length) return;

    const ids = recentlyViewed.slice(0, 8).map((rv) => rv.propertyId);

    Promise.all(
      ids.map((id) =>
        axios
          .get(`/api/properties/${id}`, {
            headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
          })
          .then((res) => res.data.data.property as Property)
          .catch(() => null)
      )
    ).then((results) => {
      setProperties(results.filter(Boolean) as Property[]);
    });
  }, [recentlyViewed.length, accessToken]);

  if (!user || properties.length === 0) return null;

  return (
    <section className="py-16 px-4 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex items-center gap-3 mb-8"
      >
        <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/40 flex items-center justify-center">
          <Clock className="w-5 h-5 text-rose-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Recently Viewed</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Pick up where you left off</p>
        </div>
      </motion.div>

      <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
        {properties.map((property, i) => (
          <motion.div
            key={property._id}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="min-w-[280px] max-w-[280px]"
          >
            <PropertyCard property={property} index={i} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
