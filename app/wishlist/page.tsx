"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { useApi } from "@/hooks/useApi";
import { useRouter } from "next/navigation";
import PropertyCard from "@/components/property/PropertyCard";
import { SkeletonGrid } from "@/components/ui/SkeletonCard";
import { Heart } from "lucide-react";
import { Property } from "@/store/propertyStore";
import Button from "@/components/ui/Button";
import Link from "next/link";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

export default function WishlistPage() {
  const { user } = useAuthStore();
  const { authHeaders } = useApi();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push("/auth/login"); return; }
    const load = async () => {
      try {
        const { data } = await axios.get("/api/auth/me", authHeaders());
        setProperties(data.data.user.wishlist || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
            >
              <Heart className="w-7 h-7 text-rose-500 fill-rose-500" />
            </motion.div>
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">Wishlist</h1>
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            {!loading && `${properties.length} saved propert${properties.length !== 1 ? "ies" : "y"}`}
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SkeletonGrid count={6} />
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
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Heart className="w-16 h-16 text-zinc-200 dark:text-zinc-700 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300 mb-2">No saved properties</h3>
              <p className="text-zinc-500 dark:text-zinc-400 mb-6">Start exploring and save properties you love</p>
              <Link href="/properties">
                <Button>Explore Properties</Button>
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
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
      </div>
    </div>
  );
}
