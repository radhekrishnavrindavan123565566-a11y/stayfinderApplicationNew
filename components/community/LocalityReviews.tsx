"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Shield, Wifi, Sparkles, Leaf, Plus, ChevronDown, ChevronUp } from "lucide-react";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { useApi } from "@/hooks/useApi";
import toast from "react-hot-toast";
import { format } from "date-fns";

interface Review {
  _id: string;
  userId: { username: string; avatar?: string };
  ratings: { safety: number; connectivity: number; amenities: number; cleanliness: number; overall: number };
  comment?: string;
  createdAt: string;
}

interface Props {
  city: string;
  locality: string;
}

const ratingCategories = [
  { key: "safety", label: "Safety", icon: <Shield className="w-4 h-4" /> },
  { key: "connectivity", label: "Connectivity", icon: <Wifi className="w-4 h-4" /> },
  { key: "amenities", label: "Amenities", icon: <Sparkles className="w-4 h-4" /> },
  { key: "cleanliness", label: "Cleanliness", icon: <Leaf className="w-4 h-4" /> },
];

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange?.(s)}
          className={`transition-colors ${onChange ? "cursor-pointer hover:scale-110" : "cursor-default"}`}
        >
          <Star className={`w-4 h-4 ${s <= value ? "fill-amber-400 text-amber-400" : "text-zinc-300"}`} />
        </button>
      ))}
    </div>
  );
}

export default function LocalityReviews({ city, locality }: Props) {
  const { user } = useAuthStore();
  const { authHeaders } = useApi();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averages, setAverages] = useState<Record<string, number> | null>(null);
  const [count, setCount] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [ratings, setRatings] = useState({ safety: 3, connectivity: 3, amenities: 3, cleanliness: 3, overall: 3 });
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    axios.get(`/api/community/locality-reviews?city=${encodeURIComponent(city)}&locality=${encodeURIComponent(locality)}`)
      .then(({ data }) => {
        setReviews(data.data.reviews);
        setAverages(data.data.averages);
        setCount(data.data.count);
      }).catch(() => {});
  };

  useEffect(() => { load(); }, [city, locality]);

  const submit = async () => {
    setSubmitting(true);
    try {
      await axios.post("/api/community/locality-reviews", { city, locality, ratings, comment }, authHeaders());
      toast.success("Review submitted!");
      setShowForm(false);
      setComment("");
      load();
    } catch {
      toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
          <span className="font-semibold text-zinc-900 dark:text-white">Locality Reviews</span>
          {averages && (
            <span className="text-sm text-zinc-500">
              {averages.overall}/5 · {count} review{count !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">
              {/* Averages */}
              {averages && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {ratingCategories.map((cat) => (
                    <div key={cat.key} className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-3 text-center">
                      <div className="flex justify-center mb-1 text-zinc-500">{cat.icon}</div>
                      <div className="text-lg font-bold text-zinc-900 dark:text-white">{averages[cat.key]}</div>
                      <div className="text-xs text-zinc-500">{cat.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add review button */}
              {user && (
                <button
                  onClick={() => setShowForm((v) => !v)}
                  className="flex items-center gap-1.5 text-sm text-rose-500 hover:text-rose-600 font-medium mb-4 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Write a review
                </button>
              )}

              {/* Review form */}
              <AnimatePresence>
                {showForm && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mb-4"
                  >
                    <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4 space-y-3 border border-zinc-200 dark:border-zinc-700">
                      {ratingCategories.map((cat) => (
                        <div key={cat.key} className="flex items-center justify-between">
                          <span className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                            {cat.icon} {cat.label}
                          </span>
                          <StarRating
                            value={ratings[cat.key as keyof typeof ratings]}
                            onChange={(v) => setRatings((p) => ({ ...p, [cat.key]: v }))}
                          />
                        </div>
                      ))}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                          <Star className="w-4 h-4" /> Overall
                        </span>
                        <StarRating value={ratings.overall} onChange={(v) => setRatings((p) => ({ ...p, overall: v }))} />
                      </div>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your experience in this locality..."
                        rows={3}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-600 text-sm bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
                      />
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={submit}
                        disabled={submitting}
                        className="w-full py-2 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 transition-colors disabled:opacity-50"
                      >
                        {submitting ? "Submitting..." : "Submit Review"}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Reviews list */}
              {reviews.length === 0 ? (
                <p className="text-sm text-zinc-400 text-center py-4">No reviews yet for this locality.</p>
              ) : (
                <div className="space-y-3">
                  {reviews.map((r, i) => (
                    <motion.div
                      key={r._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border border-zinc-100 dark:border-zinc-700 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center text-xs font-bold text-rose-500">
                            {r.userId.username[0].toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-zinc-900 dark:text-white">{r.userId.username}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <StarRating value={r.ratings.overall} />
                          <span className="text-xs text-zinc-400 ml-1">{format(new Date(r.createdAt), "MMM d, yyyy")}</span>
                        </div>
                      </div>
                      {r.comment && <p className="text-sm text-zinc-600 dark:text-zinc-400">{r.comment}</p>}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
