"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellOff, X, Check } from "lucide-react";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { useApi } from "@/hooks/useApi";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Filters {
  city?: string;
  minPrice?: string;
  maxPrice?: string;
  propertyType?: string;
  bedrooms?: string;
  nearLocation?: string;
}

interface Props {
  filters: Filters;
}

export default function SaveSearchButton({ filters }: Props) {
  const { user } = useAuthStore();
  const { authHeaders } = useApi();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const hasFilters = Object.values(filters).some((v) => v);
  if (!hasFilters) return null;

  const save = async () => {
    if (!user) { router.push("/auth/login"); return; }
    if (!name.trim()) { toast.error("Give this search a name"); return; }
    setSaving(true);
    try {
      // Convert string filters to typed
      const typed: Record<string, string | number> = {};
      if (filters.city) typed.city = filters.city;
      if (filters.propertyType) typed.propertyType = filters.propertyType;
      if (filters.nearLocation) typed.nearLocation = filters.nearLocation;
      if (filters.minPrice) typed.minPrice = parseInt(filters.minPrice);
      if (filters.maxPrice) typed.maxPrice = parseInt(filters.maxPrice);
      if (filters.bedrooms) typed.bedrooms = parseInt(filters.bedrooms);

      await axios.post("/api/saved-searches", { name, filters: typed }, authHeaders());
      setSaved(true);
      setShowModal(false);
      toast.success("Search saved! You'll be notified of new matches.");
    } catch { toast.error("Failed to save search"); }
    finally { setSaving(false); }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => saved ? null : setShowModal(true)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
          saved
            ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800"
            : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-rose-300 hover:text-rose-600"
        }`}
      >
        {saved ? <Check className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
        {saved ? "Alert saved" : "Save search"}
      </motion.button>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-6 w-full max-w-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-rose-500" />
                  <h3 className="font-bold text-zinc-900 dark:text-white">Save Search Alert</h3>
                </div>
                <button onClick={() => setShowModal(false)} className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800">
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              </div>

              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Get notified when new properties matching your filters are listed.
              </p>

              {/* Filter summary */}
              <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-3 space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                {filters.city && <p>📍 City: <span className="font-medium text-zinc-900 dark:text-white">{filters.city}</span></p>}
                {filters.propertyType && <p>🏠 Type: <span className="font-medium text-zinc-900 dark:text-white capitalize">{filters.propertyType}</span></p>}
                {(filters.minPrice || filters.maxPrice) && <p>💰 Price: <span className="font-medium text-zinc-900 dark:text-white">₹{filters.minPrice || "0"} – ₹{filters.maxPrice || "any"}</span></p>}
                {filters.bedrooms && <p>🛏 Min beds: <span className="font-medium text-zinc-900 dark:text-white">{filters.bedrooms}+</span></p>}
                {filters.nearLocation && <p>🎓 Near: <span className="font-medium text-zinc-900 dark:text-white">{filters.nearLocation}</span></p>}
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">Alert name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && save()}
                  placeholder="e.g. 2BHK near Lucknow University"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm bg-white dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                  autoFocus
                />
              </div>

              <div className="flex gap-2">
                <button onClick={save} disabled={saving || !name.trim()}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
                  {saving ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Bell className="w-4 h-4" />}
                  Save Alert
                </button>
                <button onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
