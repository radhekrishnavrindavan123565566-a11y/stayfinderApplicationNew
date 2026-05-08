"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, MapPin, IndianRupee, GraduationCap, Briefcase, Plus, X, MessageCircle, Check } from "lucide-react";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Image from "next/image";
import { format } from "date-fns";
import { useRequireAuth } from "@/hooks/useRequireAuth";

const UP_CITIES = ["Lucknow","Prayagraj","Kanpur","Varanasi","Agra","Meerut","Noida","Ghaziabad","Mathura","Aligarh","Bareilly","Moradabad","Gorakhpur","Jhansi","Firozabad"];

const LIFESTYLE_LABELS: Record<string, string> = {
  smoking: "🚬 Smoker", drinking: "🍺 Drinks", pets: "🐾 Pets OK",
  vegetarian: "🥗 Vegetarian", earlyBird: "🌅 Early Bird", studyFriendly: "📚 Study-friendly",
};

interface Profile {
  _id: string;
  userId: { _id: string; username: string; avatar?: string; createdAt: string };
  city: string;
  budget: { min: number; max: number };
  moveInDate: string;
  gender: string;
  lookingFor: string;
  occupation: string;
  institution?: string;
  lifestyle: Record<string, boolean>;
  languages: string[];
  about: string;
}

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

function ProfileCard({ profile, onMessage }: { profile: Profile; onMessage: (userId: string) => void }) {
  const activeLifestyle = Object.entries(profile.lifestyle).filter(([, v]) => v).map(([k]) => k);
  return (
    <motion.div variants={fadeUp} whileHover={{ y: -4 }}
      className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm p-5 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-white font-bold text-lg overflow-hidden flex-shrink-0">
          {profile.userId.avatar
            ? <Image src={profile.userId.avatar} alt={profile.userId.username} width={48} height={48} className="object-cover" />
            : profile.userId.username[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-zinc-900 dark:text-white truncate">{profile.userId.username}</p>
          <div className="flex items-center gap-1 text-xs text-zinc-500">
            <MapPin className="w-3 h-3 text-rose-400" /> {profile.city}
          </div>
        </div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full capitalize ${
          profile.occupation === "student" ? "bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400" : "bg-purple-100 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400"
        }`}>
          {profile.occupation === "student" ? <GraduationCap className="w-3 h-3 inline mr-1" /> : <Briefcase className="w-3 h-3 inline mr-1" />}
          {profile.occupation}
        </span>
      </div>

      {/* Budget & move-in */}
      <div className="flex items-center gap-4 text-sm">
        <span className="flex items-center gap-1 font-semibold text-zinc-900 dark:text-white">
          <IndianRupee className="w-3.5 h-3.5 text-rose-400" />
          {profile.budget.min.toLocaleString("en-IN")}–{profile.budget.max.toLocaleString("en-IN")}/mo
        </span>
        <span className="text-zinc-400 text-xs">Move-in: {format(new Date(profile.moveInDate), "MMM d, yyyy")}</span>
      </div>

      {/* Institution */}
      {profile.institution && (
        <p className="text-xs text-zinc-500 flex items-center gap-1">
          <GraduationCap className="w-3.5 h-3.5 text-blue-400" /> {profile.institution}
        </p>
      )}

      {/* About */}
      {profile.about && <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">{profile.about}</p>}

      {/* Lifestyle tags */}
      {activeLifestyle.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {activeLifestyle.map((k) => (
            <span key={k} className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-full">
              {LIFESTYLE_LABELS[k]}
            </span>
          ))}
        </div>
      )}

      {/* Languages */}
      {profile.languages.length > 0 && (
        <p className="text-xs text-zinc-400">🗣 {profile.languages.join(", ")}</p>
      )}

      {/* Looking for */}
      <p className="text-xs text-zinc-500">Looking for: <span className="font-medium capitalize text-zinc-700 dark:text-zinc-300">{profile.lookingFor} roommate</span></p>

      <Button size="sm" onClick={() => onMessage(profile.userId._id)} className="w-full mt-1 gap-2">
        <MessageCircle className="w-4 h-4" /> Send Message
      </Button>
    </motion.div>
  );
}

function CreateProfileModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const { authHeaders } = useAuthStore() as unknown as { authHeaders: () => { headers: Record<string, string> } };
  const { accessToken } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    city: "", budget: { min: 3000, max: 8000 }, moveInDate: "",
    gender: "any", lookingFor: "any", occupation: "student", institution: "",
    lifestyle: { smoking: false, drinking: false, pets: false, vegetarian: false, earlyBird: true, studyFriendly: true },
    languages: ["Hindi", "English"], about: "",
  });

  const save = async () => {
    if (!form.city || !form.moveInDate) { toast.error("City and move-in date are required"); return; }
    setSaving(true);
    try {
      await axios.post("/api/roommates", form, { headers: { Authorization: `Bearer ${accessToken}` } });
      toast.success("Profile saved!");
      onSaved();
      onClose();
    } catch { toast.error("Failed to save profile"); }
    finally { setSaving(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Create Roommate Profile</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800"><X className="w-4 h-4" /></button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">City *</label>
            <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm bg-white dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400">
              <option value="">Select city</option>
              {UP_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">Min Budget (₹)</label>
            <input type="number" value={form.budget.min} onChange={(e) => setForm({ ...form, budget: { ...form.budget, min: +e.target.value } })}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm bg-white dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400" />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">Max Budget (₹)</label>
            <input type="number" value={form.budget.max} onChange={(e) => setForm({ ...form, budget: { ...form.budget, max: +e.target.value } })}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm bg-white dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400" />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">Move-in Date *</label>
            <input type="date" value={form.moveInDate} onChange={(e) => setForm({ ...form, moveInDate: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm bg-white dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400" />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">Occupation</label>
            <select value={form.occupation} onChange={(e) => setForm({ ...form, occupation: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm bg-white dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400">
              <option value="student">Student</option>
              <option value="working">Working Professional</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">My Gender</label>
            <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm bg-white dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400">
              <option value="male">Male</option><option value="female">Female</option><option value="any">Prefer not to say</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">Looking For</label>
            <select value={form.lookingFor} onChange={(e) => setForm({ ...form, lookingFor: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm bg-white dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400">
              <option value="male">Male</option><option value="female">Female</option><option value="any">Any</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">College / Office</label>
            <input value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })}
              placeholder="e.g. Allahabad University, Infosys Lucknow"
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm bg-white dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400" />
          </div>
        </div>

        {/* Lifestyle */}
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-2">Lifestyle</label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(LIFESTYLE_LABELS).map(([key, label]) => (
              <button key={key} type="button"
                onClick={() => setForm({ ...form, lifestyle: { ...form.lifestyle, [key]: !form.lifestyle[key as keyof typeof form.lifestyle] } })}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-xs border transition-all ${
                  form.lifestyle[key as keyof typeof form.lifestyle]
                    ? "bg-rose-500 text-white border-rose-500"
                    : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700"
                }`}>
                {form.lifestyle[key as keyof typeof form.lifestyle] && <Check className="w-3 h-3" />}
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">About yourself</label>
          <textarea value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })} rows={2}
            placeholder="Tell potential roommates about yourself..."
            className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm bg-white dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none" />
        </div>

        <div className="flex gap-2 pt-2">
          <Button onClick={save} isLoading={saving} className="flex-1">Save Profile</Button>
          <Button onClick={onClose} variant="outline">Cancel</Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function RoommatesPage() {
  const { ready, user: authUser } = useRequireAuth();
  const { user, accessToken } = useAuthStore();
  const { openChat } = useChatStore();
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filters, setFilters] = useState({ city: "", maxBudget: "", occupation: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.city) params.set("city", filters.city);
      if (filters.maxBudget) params.set("maxBudget", filters.maxBudget);
      if (filters.occupation) params.set("occupation", filters.occupation);
      const { data } = await axios.get(`/api/roommates?${params}`);
      setProfiles(data.data.profiles);
    } catch { toast.error("Failed to load profiles"); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { 
    if (!ready || !authUser) return;
    load(); 
  }, [ready, authUser, load]);

  if (!ready || !authUser) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-rose-500 border-t-transparent" />
      </div>
    );
  }

  const handleMessage = (userId: string) => {
    if (!user) { router.push("/auth/login"); return; }
    const ids = [user._id, userId].sort();
    openChat(ids.join("_"));
    router.push("/chat");
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Users className="w-7 h-7 text-rose-500" /> Roommate Finder
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Find compatible roommates across UP cities</p>
            </div>
            {user && user.role !== "owner" && (
              <Button onClick={() => setShowCreate(true)} className="gap-2">
                <Plus className="w-4 h-4" /> Create Profile
              </Button>
            )}
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-4 mb-6 flex flex-wrap gap-3">
          <select value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            className="flex-1 min-w-[140px] px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm bg-white dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400">
            <option value="">All Cities</option>
            {UP_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="number" value={filters.maxBudget} onChange={(e) => setFilters({ ...filters, maxBudget: e.target.value })}
            placeholder="Max Budget (₹)"
            className="flex-1 min-w-[140px] px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm bg-white dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400" />
          <select value={filters.occupation} onChange={(e) => setFilters({ ...filters, occupation: e.target.value })}
            className="flex-1 min-w-[140px] px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm bg-white dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400">
            <option value="">All Occupations</option>
            <option value="student">Student</option>
            <option value="working">Working</option>
          </select>
        </motion.div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full" />
          </div>
        ) : profiles.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="text-6xl mb-4">👥</div>
            <p className="text-zinc-500 dark:text-zinc-400 text-lg mb-2">No roommate profiles found</p>
            <p className="text-zinc-400 text-sm mb-6">Be the first to create a profile in this city!</p>
            {user && user.role !== "owner" && <Button onClick={() => setShowCreate(true)}>Create Profile</Button>}
          </motion.div>
        ) : (
          <motion.div variants={stagger} initial="hidden" animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {profiles.map((p) => (
              <ProfileCard key={p._id} profile={p} onMessage={handleMessage} />
            ))}
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showCreate && <CreateProfileModal onClose={() => setShowCreate(false)} onSaved={load} />}
      </AnimatePresence>
    </div>
  );
}
