"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { useApi } from "@/hooks/useApi";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, Eye, Star, MapPin, BedDouble, Users, ToggleLeft, ToggleRight, BarChart2 } from "lucide-react";
import Button from "@/components/ui/Button";

interface Property {
  _id: string;
  title: string;
  images: string[];
  price: number;
  location: { city: string; country: string };
  propertyType: string;
  bedrooms: number;
  maxGuests: number;
  isAvailable: boolean;
  averageRating: number;
  totalReviews: number;
  viewCount: number;
  createdAt: string;
}

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as number[] } },
};

export default function MyPropertiesPage() {
  const { user } = useAuthStore();
  const { authHeaders } = useApi();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!user || user.role === "tenant") { router.push("/"); return; }
    fetchProperties();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, user]);

  const fetchProperties = async () => {
    try {
      const { data } = await axios.get("/api/properties/my", authHeaders());
      setProperties(data.data.properties);
    } catch {
      toast.error("Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (id: string, current: boolean) => {
    try {
      await axios.put(`/api/properties/${id}`, { isAvailable: !current }, authHeaders());
      setProperties((prev) => prev.map((p) => p._id === id ? { ...p, isAvailable: !current } : p));
      toast.success(`Property ${!current ? "activated" : "deactivated"}`);
    } catch { toast.error("Failed to update"); }
  };

  const deleteProperty = async (id: string) => {
    if (!confirm("Delete this property? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await axios.delete(`/api/properties/${id}`, authHeaders());
      setProperties((prev) => prev.filter((p) => p._id !== id));
      toast.success("Property deleted");
    } catch { toast.error("Failed to delete"); }
    finally { setDeletingId(null); }
  };

  if (!mounted) return null;

  const statItems = [
    { label: "Total Listings", value: properties.length, icon: <BarChart2 className="w-4 h-4 text-rose-500" />, bg: "bg-rose-50 dark:bg-rose-950/20" },
    { label: "Active", value: properties.filter((p) => p.isAvailable).length, icon: <ToggleRight className="w-4 h-4 text-green-500" />, bg: "bg-green-50 dark:bg-green-950/20" },
    { label: "Total Views", value: properties.reduce((s, p) => s + (p.viewCount || 0), 0), icon: <Eye className="w-4 h-4 text-blue-500" />, bg: "bg-blue-50 dark:bg-blue-950/20" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">My Properties</h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
              {properties.length} listing{properties.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link href="/dashboard/properties/new">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Property</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </Link>
        </motion.div>

        {/* Stats row */}
        <AnimatePresence>
          {properties.length > 0 && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-3 gap-3 sm:gap-4 mb-8"
            >
              {statItems.map((stat) => (
                <motion.div
                  key={stat.label}
                  whileHover={{ y: -2 }}
                  className="bg-white dark:bg-zinc-900 rounded-2xl p-3 sm:p-4 shadow-sm border border-zinc-100 dark:border-zinc-800 flex items-center gap-2 sm:gap-3"
                >
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">{stat.value}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.08 }}
                className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-sm border border-zinc-100 dark:border-zinc-800"
              >
                <div className="h-48 skeleton-shimmer" />
                <div className="p-4 space-y-2">
                  <div className="h-4 skeleton-shimmer rounded w-3/4" />
                  <div className="h-3 skeleton-shimmer rounded w-1/2" />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && properties.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-16 h-16 bg-rose-50 dark:bg-rose-950/20 rounded-2xl flex items-center justify-center mx-auto mb-4"
            >
              <Plus className="w-7 h-7 text-rose-400" />
            </motion.div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">No properties yet</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">List your first property and start earning</p>
            <Link href="/dashboard/properties/new">
              <Button>Add Your First Property</Button>
            </Link>
          </motion.div>
        )}

        {/* Property grid */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 gap-5"
        >
          <AnimatePresence>
            {properties.map((property) => (
              <motion.div
                key={property._id}
                variants={fadeUp}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -3, boxShadow: "0 12px 30px rgba(0,0,0,0.1)" }}
                className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-sm border border-zinc-100 dark:border-zinc-800 group transition-shadow"
              >
                {/* Image */}
                <div className="relative h-48 bg-zinc-100 dark:bg-zinc-800">
                  {property.images[0] ? (
                    <Image
                      src={property.images[0]}
                      alt={property.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">🏠</div>
                  )}
                  <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    property.isAvailable ? "bg-green-500 text-white" : "bg-zinc-500 text-white"
                  }`}>
                    {property.isAvailable ? "Active" : "Inactive"}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm px-2.5 py-1 rounded-xl text-sm font-bold text-zinc-900 dark:text-white shadow">
                    ${property.price}/night
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-zinc-900 dark:text-white truncate mb-1">{property.title}</h3>
                  <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                    <MapPin className="w-3 h-3" /> {property.location.city}, {property.location.country}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 mb-4 flex-wrap">
                    <span className="flex items-center gap-1"><BedDouble className="w-3 h-3" /> {property.bedrooms} bed</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {property.maxGuests} guests</span>
                    {property.averageRating > 0 && (
                      <span className="flex items-center gap-1 text-amber-500">
                        <Star className="w-3 h-3 fill-current" /> {property.averageRating.toFixed(1)}
                      </span>
                    )}
                    <span className="flex items-center gap-1 ml-auto">
                      <Eye className="w-3 h-3" /> {property.viewCount || 0}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link href={`/properties/${property._id}`} className="flex-1">
                      <button className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                    </Link>
                    <Link href={`/dashboard/properties/${property._id}/edit`} className="flex-1">
                      <button className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                    </Link>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleAvailability(property._id, property.isAvailable)}
                      className="flex items-center justify-center p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                      title={property.isAvailable ? "Deactivate" : "Activate"}
                    >
                      {property.isAvailable
                        ? <ToggleRight className="w-4 h-4 text-green-500" />
                        : <ToggleLeft className="w-4 h-4 text-zinc-400" />}
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => deleteProperty(property._id)}
                      disabled={deletingId === property._id}
                      className="flex items-center justify-center p-2 rounded-xl border border-red-100 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-400 hover:text-red-500 transition-colors disabled:opacity-50"
                    >
                      {deletingId === property._id
                        ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full" />
                        : <Trash2 className="w-4 h-4" />}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
