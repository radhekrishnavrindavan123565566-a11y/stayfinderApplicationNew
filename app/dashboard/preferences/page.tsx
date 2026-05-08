"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import toast from "react-hot-toast";
import { usePreferencesStore, UserPreferencesData } from "@/store/preferencesStore";
import { useAuthStore } from "@/store/authStore";
import { Bell, BellOff, Plus, Trash2, Search, SlidersHorizontal } from "lucide-react";
import axios from "axios";
import { useApi } from "@/hooks/useApi";
import Button from "@/components/ui/Button";
import { useRequireAuth } from "@/hooks/useRequireAuth";

const AMENITY_OPTIONS = ["WiFi", "AC", "Parking", "Kitchen", "Gym", "Pool", "Laundry", "Security"];
const TENANT_TYPES = [
  { value: "student", label: "🎓 Student" },
  { value: "family", label: "👨‍👩‍👧 Family" },
  { value: "professional", label: "💼 Professional" },
  { value: "couple", label: "💑 Couple" },
] as const;

interface SavedSearch {
  _id?: string;
  filters: { city?: string; minPrice?: number; maxPrice?: number; bedrooms?: number; propertyType?: string };
  alertEnabled: boolean;
}

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: "easeOut" },
  }),
};

const inputCls = "w-full border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white dark:bg-zinc-800 dark:text-white transition-colors";

export default function PreferencesPage() {
  const { ready, user: authUser } = useRequireAuth();
  const { user } = useAuthStore();
  const { authHeaders } = useApi();
  const { preferences, isLoading, fetchPreferences, updatePreferences } = usePreferencesStore();

  const [budgetMin, setBudgetMin] = useState(0);
  const [budgetMax, setBudgetMax] = useState(0);
  const [bedrooms, setBedrooms] = useState(1);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [cityInput, setCityInput] = useState("");
  const [tenantType, setTenantType] = useState<UserPreferencesData["tenantType"]>("professional");
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showAddSearch, setShowAddSearch] = useState(false);
  const [newSearch, setNewSearch] = useState<SavedSearch["filters"]>({});
  const [savingSearch, setSavingSearch] = useState(false);

  useEffect(() => {
    if (user) fetchPreferences();
  }, [user, fetchPreferences]);

  useEffect(() => {
    if (preferences) {
      setBudgetMin(preferences.budget.min);
      setBudgetMax(preferences.budget.max);
      setBedrooms(preferences.preferredBedrooms);
      setAmenities(preferences.preferredAmenities);
      setCities(preferences.preferredCities);
      setTenantType(preferences.tenantType);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setSavedSearches((preferences as any).savedSearches || []);
    }
  }, [preferences]);

  const toggleAmenity = (a: string) =>
    setAmenities((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);

  const addCity = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && cityInput.trim()) {
      e.preventDefault();
      const city = cityInput.trim();
      if (!cities.includes(city)) setCities((prev) => [...prev, city]);
      setCityInput("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updatePreferences({
      budget: { min: budgetMin, max: budgetMax },
      preferredBedrooms: bedrooms,
      preferredAmenities: amenities,
      preferredCities: cities,
      tenantType,
    });
    toast.success("Preferences saved!");
  };

  const saveSearch = async () => {
    if (!newSearch.city && !newSearch.maxPrice && !newSearch.bedrooms) {
      toast.error("Add at least one filter"); return;
    }
    setSavingSearch(true);
    try {
      const { data } = await axios.post("/api/user/preferences", {
        savedSearch: { filters: newSearch, alertEnabled: true },
      }, authHeaders());
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setSavedSearches((data.data.preferences as any).savedSearches || []);
      setNewSearch({});
      setShowAddSearch(false);
      toast.success("Search saved with alerts!");
    } catch { toast.error("Failed to save search"); }
    finally { setSavingSearch(false); }
  };

  const toggleAlert = async (index: number) => {
    const updated = savedSearches.map((s, i) => i === index ? { ...s, alertEnabled: !s.alertEnabled } : s);
    setSavedSearches(updated);
    try { await axios.patch("/api/user/preferences", { savedSearches: updated }, authHeaders()); }
    catch { toast.error("Failed to update alert"); }
  };

  const removeSearch = async (index: number) => {
    const updated = savedSearches.filter((_, i) => i !== index);
    setSavedSearches(updated);
    try {
      await axios.patch("/api/user/preferences", { savedSearches: updated }, authHeaders());
      toast.success("Search removed");
    } catch { toast.error("Failed to remove search"); }
  };

  if (!ready || !authUser) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-rose-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) return (
    <div className="min-h-screen pt-20 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <p className="text-zinc-500 dark:text-zinc-400">Please log in to manage preferences.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-20 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="pt-6 mb-8"
        >
          <div className="flex items-center gap-3 mb-1">
            <SlidersHorizontal className="w-6 h-6 text-rose-500" />
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">My Preferences</h1>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Help us find your perfect match.</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Budget */}
          <motion.section custom={0} variants={sectionVariants} initial="hidden" animate="show"
            className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 sm:p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-zinc-900 dark:text-white">Budget Range <span className="text-zinc-400 font-normal text-sm">(per night)</span></h2>
            <div className="flex gap-3 sm:gap-4">
              <div className="flex-1">
                <label className="text-xs text-zinc-500 dark:text-zinc-400 mb-1.5 block">Min ($)</label>
                <input type="number" min={0} value={budgetMin} onChange={(e) => setBudgetMin(Number(e.target.value))} className={inputCls} />
              </div>
              <div className="flex-1">
                <label className="text-xs text-zinc-500 dark:text-zinc-400 mb-1.5 block">Max ($)</label>
                <input type="number" min={0} value={budgetMax} onChange={(e) => setBudgetMax(Number(e.target.value))} className={inputCls} />
              </div>
            </div>
          </motion.section>

          {/* Bedrooms */}
          <motion.section custom={1} variants={sectionVariants} initial="hidden" animate="show"
            className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 sm:p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-zinc-900 dark:text-white">Preferred Bedrooms</h2>
            <div className="flex gap-2 flex-wrap">
              {[1, 2, 3, 4, 5].map((n) => (
                <motion.button
                  key={n}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setBedrooms(n)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                    bedrooms === n
                      ? "bg-rose-500 text-white border-rose-500 shadow-sm"
                      : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-rose-300"
                  }`}
                >
                  {n} {n === 1 ? "Bed" : "Beds"}
                </motion.button>
              ))}
            </div>
          </motion.section>

          {/* Amenities */}
          <motion.section custom={2} variants={sectionVariants} initial="hidden" animate="show"
            className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 sm:p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-zinc-900 dark:text-white">Preferred Amenities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {AMENITY_OPTIONS.map((a) => (
                <motion.label
                  key={a}
                  whileTap={{ scale: 0.96 }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer text-sm transition-all ${
                    amenities.includes(a)
                      ? "border-rose-400 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400"
                      : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300"
                  }`}
                >
                  <input type="checkbox" checked={amenities.includes(a)} onChange={() => toggleAmenity(a)} className="sr-only" />
                  <motion.span
                    animate={{ scale: amenities.includes(a) ? 1 : 0.8, opacity: amenities.includes(a) ? 1 : 0 }}
                    className="w-3 h-3 rounded-full bg-rose-500 flex-shrink-0"
                  />
                  {a}
                </motion.label>
              ))}
            </div>
          </motion.section>

          {/* Cities */}
          <motion.section custom={3} variants={sectionVariants} initial="hidden" animate="show"
            className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 sm:p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-zinc-900 dark:text-white">Preferred Cities</h2>
            <input
              type="text"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              onKeyDown={addCity}
              placeholder="Type a city and press Enter"
              className={inputCls}
            />
            <AnimatePresence>
              {cities.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-wrap gap-2 overflow-hidden"
                >
                  {cities.map((city) => (
                    <motion.span
                      key={city}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 rounded-full text-xs font-medium"
                    >
                      {city}
                      <button type="button" onClick={() => setCities((p) => p.filter((c) => c !== city))}
                        className="hover:text-rose-900 dark:hover:text-rose-200 transition-colors ml-0.5">✕</button>
                    </motion.span>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>

          {/* Tenant type */}
          <motion.section custom={4} variants={sectionVariants} initial="hidden" animate="show"
            className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 sm:p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-zinc-900 dark:text-white">I am a...</h2>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {TENANT_TYPES.map(({ value, label }) => (
                <motion.label
                  key={value}
                  whileTap={{ scale: 0.96 }}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border cursor-pointer text-sm font-medium transition-all ${
                    tenantType === value
                      ? "border-rose-400 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400"
                      : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300"
                  }`}
                >
                  <input type="radio" name="tenantType" value={value} checked={tenantType === value}
                    onChange={() => setTenantType(value)} className="sr-only" />
                  {label}
                </motion.label>
              ))}
            </div>
          </motion.section>

          <Button type="submit" isLoading={isLoading} className="w-full" size="lg">
            Save Preferences
          </Button>
        </form>

        {/* Saved Searches */}
        <motion.section
          custom={5}
          variants={sectionVariants}
          initial="hidden"
          animate="show"
          className="mt-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 sm:p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-rose-500" />
              <h2 className="font-semibold text-zinc-900 dark:text-white">Saved Searches</h2>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddSearch((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-sm font-medium hover:bg-rose-100 dark:hover:bg-rose-950/30 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Search
            </motion.button>
          </div>

          <AnimatePresence>
            {showAddSearch && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden mb-4"
              >
                <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4 space-y-3 border border-zinc-200 dark:border-zinc-700">
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">New Saved Search</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-zinc-500 dark:text-zinc-400 mb-1.5 block">City</label>
                      <input value={newSearch.city || ""} onChange={(e) => setNewSearch((p) => ({ ...p, city: e.target.value }))}
                        placeholder="e.g. New York" className={inputCls} />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 dark:text-zinc-400 mb-1.5 block">Max Price ($)</label>
                      <input type="number" value={newSearch.maxPrice || ""} onChange={(e) => setNewSearch((p) => ({ ...p, maxPrice: Number(e.target.value) }))}
                        placeholder="e.g. 2000" className={inputCls} />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 dark:text-zinc-400 mb-1.5 block">Min Bedrooms</label>
                      <select value={newSearch.bedrooms || ""} onChange={(e) => setNewSearch((p) => ({ ...p, bedrooms: Number(e.target.value) }))} className={inputCls}>
                        <option value="">Any</option>
                        {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}+</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 dark:text-zinc-400 mb-1.5 block">Property Type</label>
                      <select value={newSearch.propertyType || ""} onChange={(e) => setNewSearch((p) => ({ ...p, propertyType: e.target.value }))} className={inputCls}>
                        <option value="">Any</option>
                        {["apartment", "house", "villa", "studio", "condo"].map((t) => (
                          <option key={t} value={t} className="capitalize">{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <Button onClick={saveSearch} isLoading={savingSearch} className="w-full" size="sm">
                    Save &amp; Enable Alerts
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {savedSearches.length === 0 ? (
            <p className="text-sm text-zinc-400 dark:text-zinc-500 text-center py-4">
              No saved searches yet. Add one to get notified of new listings.
            </p>
          ) : (
            <div className="space-y-2">
              {savedSearches.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors"
                >
                  <div className="flex flex-wrap gap-1.5 min-w-0">
                    {s.filters.city && <span className="text-xs bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">{s.filters.city}</span>}
                    {s.filters.maxPrice && <span className="text-xs bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">≤₹{s.filters.maxPrice}</span>}
                    {s.filters.bedrooms && <span className="text-xs bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full">{s.filters.bedrooms}+ beds</span>}
                    {s.filters.propertyType && <span className="text-xs bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full capitalize">{s.filters.propertyType}</span>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleAlert(i)}
                      className={`p-1.5 rounded-lg transition-colors ${s.alertEnabled ? "text-rose-500 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100" : "text-zinc-400 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100"}`}
                      title={s.alertEnabled ? "Disable alerts" : "Enable alerts"}
                    >
                      {s.alertEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeSearch(i)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
}
