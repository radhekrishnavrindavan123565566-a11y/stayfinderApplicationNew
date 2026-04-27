"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import axios from "axios";
import PropertyCard from "@/components/property/PropertyCard";
import { Property } from "@/store/propertyStore";

export default function SimilarProperties({ propertyId }: { propertyId: string }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/properties/${propertyId}/similar`)
      .then(({ data }) => setProperties(data.data.properties))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [propertyId]);

  if (loading || properties.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mt-12"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Similar Properties</h2>
          <p className="text-xs text-zinc-500">Based on location, type & price</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {properties.map((p, i) => (
          <motion.div
            key={p._id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
          >
            <PropertyCard property={p} index={i} />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
