"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, DollarSign, Home, Calendar, Star, Zap } from "lucide-react";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import DemandInsights from "@/components/analytics/DemandInsights";

interface AnalyticsData {
  totalEarnings: number;
  platformFees: number;
  monthlyEarnings: { _id: { year: number; month: number }; earnings: number; bookings: number }[];
  bookingStats: Record<string, number>;
  properties: { _id: string; title: string; averageRating: number; totalReviews: number; isAvailable: boolean; isBoosted: boolean }[];
  occupancyRate: number;
  totalProperties: number;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string; sub?: string; color: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -3, boxShadow: "0 12px 30px rgba(0,0,0,0.08)" }}
      className="bg-white dark:bg-zinc-900 rounded-2xl p-4 sm:p-5 shadow-sm border border-zinc-100 dark:border-zinc-800 transition-shadow"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium">{label}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">{value}</p>
      {sub && <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">{sub}</p>}
    </motion.div>
  );
}

function EarningsChart({ data }: { data: AnalyticsData["monthlyEarnings"] }) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-40 text-zinc-400 dark:text-zinc-500 text-sm">
        No earnings data yet
      </div>
    );
  }
  const max = Math.max(...data.map((d) => d.earnings), 1);
  return (
    <div className="flex items-end gap-1.5 sm:gap-2 h-40 px-2">
      {data.map((d, i) => {
        const height = Math.max(4, (d.earnings / max) * 100);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
            <div className="relative w-full flex items-end" style={{ height: "100%" }}>
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: i * 0.05, type: "spring", stiffness: 200, damping: 20 }}
                style={{ height: `${height}%`, transformOrigin: "bottom" }}
                className="w-full bg-rose-400 dark:bg-rose-500 rounded-t-md group-hover:bg-rose-500 dark:group-hover:bg-rose-400 transition-colors cursor-pointer"
                title={`$${d.earnings.toFixed(2)}`}
              />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 dark:bg-zinc-700 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                ${d.earnings.toFixed(0)}
              </div>
            </div>
            <span className="text-[9px] sm:text-[10px] text-zinc-400 dark:text-zinc-500">
              {MONTHS[d._id.month - 1]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function AnalyticsPage() {
  const { user, accessToken } = useAuthStore();
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [boosting, setBoosting] = useState<string | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  useEffect(() => {
    if (!user || (user.role !== "owner" && user.role !== "admin")) {
      router.push("/dashboard");
      return;
    }
    fetchAnalytics();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      const { data: res } = await axios.get("/api/analytics", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setData(res.data);
    } catch {
      toast.error("Failed to load analytics");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBoost = async (propertyId: string) => {
    setBoosting(propertyId);
    try {
      await axios.post("/api/properties/boost", { propertyId }, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      toast.success("Property boosted for 7 days!");
      fetchAnalytics();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Boost failed";
      toast.error(msg);
    } finally {
      setBoosting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!data) return null;

  const totalBookings = Object.values(data.bookingStats).reduce((a, b) => a + b, 0);

  const statCards = [
    { icon: DollarSign, label: "Total Earnings", value: `$${data.totalEarnings.toFixed(2)}`, sub: "After platform fee", color: "bg-green-100 text-green-600 dark:bg-green-950/30 dark:text-green-400" },
    { icon: Calendar, label: "Total Bookings", value: String(totalBookings), sub: `${data.bookingStats.approved || 0} approved`, color: "bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400" },
    { icon: TrendingUp, label: "Occupancy Rate", value: `${data.occupancyRate}%`, sub: "This month", color: "bg-purple-100 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400" },
    { icon: Home, label: "Properties", value: String(data.totalProperties), sub: `${data.properties.filter((p) => p.isBoosted).length} boosted`, color: "bg-orange-100 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400" },
  ];

  const bookingStatuses = ["pending", "approved", "rejected", "cancelled", "completed"];
  const statusColors: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400",
    approved: "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400",
    rejected: "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400",
    cancelled: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
    completed: "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400",
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">Analytics</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            Track your earnings, bookings, and property performance
          </p>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
        >
          {statCards.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </motion.div>

        {/* Earnings chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl p-4 sm:p-5 shadow-sm border border-zinc-100 dark:border-zinc-800"
        >
          <h2 className="font-semibold text-zinc-900 dark:text-white mb-4">Monthly Earnings</h2>
          <EarningsChart data={data.monthlyEarnings} />
        </motion.div>

        {/* Booking breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl p-4 sm:p-5 shadow-sm border border-zinc-100 dark:border-zinc-800"
        >
          <h2 className="font-semibold text-zinc-900 dark:text-white mb-4">Booking Breakdown</h2>
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3"
          >
            {bookingStatuses.map((status) => (
              <motion.div
                key={status}
                variants={fadeUp}
                whileHover={{ scale: 1.04 }}
                className={`text-center p-3 rounded-xl ${statusColors[status]}`}
              >
                <p className="text-xl font-bold">{data.bookingStats[status] || 0}</p>
                <p className="text-xs capitalize mt-1 opacity-80">{status}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Demand Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl p-4 sm:p-5 shadow-sm border border-zinc-100 dark:border-zinc-800"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className="font-semibold text-zinc-900 dark:text-white">Demand Insights</h2>
            {data.properties.length > 0 && (
              <select
                value={selectedPropertyId ?? ""}
                onChange={(e) => setSelectedPropertyId(e.target.value || null)}
                className="text-xs border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white dark:bg-zinc-800 dark:text-white w-full sm:w-auto"
              >
                <option value="">Select a property</option>
                {data.properties.map((p) => (
                  <option key={p._id} value={p._id}>{p.title}</option>
                ))}
              </select>
            )}
          </div>
          <AnimatePresence mode="wait">
            {selectedPropertyId ? (
              <motion.div
                key={selectedPropertyId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <DemandInsights propertyId={selectedPropertyId} />
              </motion.div>
            ) : (
              <motion.p
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-zinc-400 dark:text-zinc-500 text-center py-6"
              >
                Select a property to view demand insights
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Properties with boost */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl p-4 sm:p-5 shadow-sm border border-zinc-100 dark:border-zinc-800"
        >
          <h2 className="font-semibold text-zinc-900 dark:text-white mb-4">Your Properties</h2>
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
            {data.properties.length === 0 ? (
              <p className="text-center text-zinc-400 dark:text-zinc-500 text-sm py-4">No properties yet</p>
            ) : (
              data.properties.map((p) => (
                <motion.div
                  key={p._id}
                  variants={fadeUp}
                  whileHover={{ x: 2 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-zinc-900 dark:text-white truncate">{p.title}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {p.averageRating.toFixed(1)} ({p.totalReviews} reviews)
                      </span>
                      {p.isBoosted && (
                        <span className="text-[10px] bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded-full font-medium">
                          Boosted
                        </span>
                      )}
                    </div>
                  </div>
                  {!p.isBoosted && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleBoost(p._id)}
                      disabled={boosting === p._id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs rounded-xl font-medium transition-colors disabled:opacity-50 flex-shrink-0"
                    >
                      <Zap className="w-3 h-3" />
                      {boosting === p._id ? "Boosting..." : "Boost $29.99"}
                    </motion.button>
                  )}
                </motion.div>
              ))
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
