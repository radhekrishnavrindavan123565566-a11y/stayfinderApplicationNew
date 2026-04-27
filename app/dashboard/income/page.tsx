"use client";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, DollarSign, Home, Users, Send, Zap,
  ChevronDown, ChevronUp, CheckCircle, AlertCircle, MessageSquare,
} from "lucide-react";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { useApi } from "@/hooks/useApi";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

// ── Earnings Bar Chart ────────────────────────────────────────────────────────
function EarningsChart({ data }: { data: { _id: { year: number; month: number }; earnings: number; bookings: number }[] }) {
  if (!data.length) return <p className="text-center text-zinc-400 text-sm py-8">No earnings data yet</p>;
  const max = Math.max(...data.map((d) => d.earnings), 1);
  return (
    <div className="flex items-end gap-2 h-44 px-1">
      {data.map((d, i) => {
        const h = Math.max(4, (d.earnings / max) * 100);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
            <div className="relative w-full flex items-end" style={{ height: "100%" }}>
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: i * 0.05, type: "spring", stiffness: 200, damping: 20 }}
                style={{ height: `${h}%`, transformOrigin: "bottom" }}
                className="w-full bg-gradient-to-t from-rose-500 to-rose-400 rounded-t-lg group-hover:from-rose-600 group-hover:to-rose-500 transition-colors cursor-pointer"
              />
              <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                ₹{d.earnings.toLocaleString("en-IN")} · {d.bookings} booking{d.bookings !== 1 ? "s" : ""}
              </div>
            </div>
            <span className="text-[9px] text-zinc-400">{MONTHS[d._id.month - 1]}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Auto Pricing Panel ────────────────────────────────────────────────────────
function AutoPricingPanel({ authHeaders }: { authHeaders: () => { headers: Record<string, string> } }) {
  const [data, setData] = useState<{
    properties: { _id: string; title: string; currentPrice: number; vacantDays: number; qualifies: boolean; suggestedPrice: number; suggestedDrop: number }[];
    qualifying: number;
  } | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [applying, setApplying] = useState(false);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data: res } = await axios.get("/api/owner/auto-pricing", authHeaders());
      setData(res.data);
      // Auto-select qualifying ones
      const ids = res.data.properties.filter((p: { qualifies: boolean }) => p.qualifies).map((p: { _id: string }) => p._id);
      setSelected(new Set(ids));
    } catch { /* silent */ }
  }, [authHeaders]);

  useEffect(() => { if (open) load(); }, [open, load]);

  const apply = async () => {
    if (selected.size === 0) return;
    setApplying(true);
    try {
      const { data: res } = await axios.post("/api/owner/auto-pricing", { propertyIds: [...selected] }, authHeaders());
      toast.success(`Price updated for ${res.data.count} properties`);
      load();
    } catch { toast.error("Failed to apply pricing"); }
    finally { setApplying(false); }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center">
            <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-zinc-900 dark:text-white text-sm">Auto-Pricing</p>
            <p className="text-xs text-zinc-500">Drop price 10% after 15 days vacancy</p>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
      </button>

      <AnimatePresence>
        {open && data && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-4">
              {data.properties.length === 0 && (
                <p className="text-sm text-zinc-400 text-center py-4">No properties found</p>
              )}
              {data.properties.map((p) => (
                <div key={p._id} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                  p.qualifies ? "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/10" : "border-zinc-100 dark:border-zinc-800"
                }`}>
                  <input
                    type="checkbox"
                    checked={selected.has(p._id)}
                    onChange={(e) => {
                      const s = new Set(selected);
                      e.target.checked ? s.add(p._id) : s.delete(p._id);
                      setSelected(s);
                    }}
                    className="accent-rose-500"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{p.title}</p>
                    <p className="text-xs text-zinc-500">{p.vacantDays} days vacant</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">₹{p.currentPrice.toLocaleString("en-IN")}</p>
                    {p.qualifies && (
                      <p className="text-xs text-amber-600 dark:text-amber-400">→ ₹{p.suggestedPrice.toLocaleString("en-IN")}</p>
                    )}
                  </div>
                  {p.qualifies && <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />}
                </div>
              ))}
              {data.qualifying > 0 && (
                <Button onClick={apply} isLoading={applying} size="sm" className="w-full mt-2">
                  Apply Price Drop to {selected.size} Properties
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Broadcast Panel ───────────────────────────────────────────────────────────
function BroadcastPanel({ authHeaders, properties }: {
  authHeaders: () => { headers: Record<string, string> };
  properties: { _id: string; title: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [tenants, setTenants] = useState<{ _id: string; username: string; email: string; property?: string }[]>([]);
  const [sending, setSending] = useState(false);

  const loadTenants = useCallback(async () => {
    try {
      const url = propertyId ? `/api/owner/broadcast?propertyId=${propertyId}` : "/api/owner/broadcast";
      const { data } = await axios.get(url, authHeaders());
      setTenants(data.data.tenants);
    } catch { /* silent */ }
  }, [propertyId, authHeaders]);

  useEffect(() => { if (open) loadTenants(); }, [open, propertyId, loadTenants]);

  const send = async () => {
    if (!msg.trim()) { toast.error("Enter a message"); return; }
    setSending(true);
    try {
      const { data } = await axios.post("/api/owner/broadcast", { message: msg, propertyId: propertyId || undefined }, authHeaders());
      toast.success(`Sent to ${data.data.sent} tenants`);
      setMsg("");
      setOpen(false);
    } catch { toast.error("Broadcast failed"); }
    finally { setSending(false); }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center">
            <Send className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-zinc-900 dark:text-white text-sm">Broadcast Message</p>
            <p className="text-xs text-zinc-500">Send update to all past tenants in one click</p>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-3 border-t border-zinc-100 dark:border-zinc-800 pt-4">
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">Filter by Property (optional)</label>
                <select
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm bg-white dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                >
                  <option value="">All properties ({tenants.length} tenants)</option>
                  {properties.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
                </select>
              </div>

              {tenants.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-3 py-2">
                  <Users className="w-3.5 h-3.5" />
                  {tenants.length} tenant{tenants.length !== 1 ? "s" : ""} will receive this message
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">Message</label>
                <textarea
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  rows={3}
                  placeholder="e.g. Property is now available from June 1st. Contact me to book!"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm bg-white dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
                />
                <p className="text-xs text-zinc-400 mt-1">{msg.length}/500 characters</p>
              </div>

              <div className="flex gap-2">
                <Button onClick={send} isLoading={sending} size="sm" className="flex-1" disabled={!msg.trim() || tenants.length === 0}>
                  <MessageSquare className="w-4 h-4" /> Send to {tenants.length} Tenants
                </Button>
                <Button onClick={() => setOpen(false)} variant="outline" size="sm">Cancel</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function IncomeDashboardPage() {
  const { user } = useAuthStore();
  const { authHeaders } = useApi();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<{
    totalEarnings: number;
    platformFees: number;
    monthlyEarnings: { _id: { year: number; month: number }; earnings: number; bookings: number }[];
    bookingStats: Record<string, number>;
    occupancyRate: number;
    totalProperties: number;
    properties: { _id: string; title: string; averageRating: number; totalReviews: number; isAvailable: boolean; isBoosted: boolean }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push("/auth/login"); return; }
    if (user.role !== "owner" && user.role !== "admin") { router.push("/dashboard"); return; }
    axios.get("/api/analytics", authHeaders())
      .then(({ data }) => setAnalytics(data.data))
      .catch(() => toast.error("Failed to load analytics"))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full" />
    </div>
  );

  if (!analytics) return null;

  const totalBookings = Object.values(analytics.bookingStats).reduce((a, b) => a + b, 0);
  const netEarnings = analytics.totalEarnings - analytics.platformFees;

  // Market comparison (mock — replace with real price intelligence data)
  const marketAvg = analytics.totalEarnings > 0
    ? Math.round(analytics.totalEarnings / Math.max(1, totalBookings) * 1.15)
    : 0;

  const statCards = [
    { icon: DollarSign, label: "Net Earnings", value: `₹${netEarnings.toLocaleString("en-IN")}`, sub: `Platform fee: ₹${analytics.platformFees.toLocaleString("en-IN")}`, color: "bg-green-100 text-green-600 dark:bg-green-950/30 dark:text-green-400" },
    { icon: TrendingUp, label: "Occupancy Rate", value: `${analytics.occupancyRate}%`, sub: "This month", color: "bg-purple-100 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400" },
    { icon: Home, label: "Properties", value: String(analytics.totalProperties), sub: `${analytics.properties.filter((p) => p.isAvailable).length} active`, color: "bg-rose-100 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400" },
    { icon: Users, label: "Total Bookings", value: String(totalBookings), sub: `${analytics.bookingStats.approved || 0} approved`, color: "bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">Rental Income</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Earnings, occupancy & smart tools</p>
        </motion.div>

        {/* Stat cards */}
        <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statCards.map((s) => (
            <motion.div key={s.label} variants={fadeUp} whileHover={{ y: -3 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-sm border border-zinc-100 dark:border-zinc-800">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                <s.icon className="w-4 h-4" />
              </div>
              <p className="text-xl font-bold text-zinc-900 dark:text-white">{s.value}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{s.label}</p>
              {s.sub && <p className="text-[10px] text-zinc-400 mt-0.5">{s.sub}</p>}
            </motion.div>
          ))}
        </motion.div>

        {/* Earnings chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-zinc-900 dark:text-white">Monthly Earnings</h2>
            {marketAvg > 0 && (
              <span className="text-xs text-zinc-400 bg-zinc-50 dark:bg-zinc-800 px-2 py-1 rounded-lg">
                Market avg: ₹{marketAvg.toLocaleString("en-IN")}
              </span>
            )}
          </div>
          <EarningsChart data={analytics.monthlyEarnings} />
        </motion.div>

        {/* Occupancy breakdown */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-zinc-100 dark:border-zinc-800">
          <h2 className="font-semibold text-zinc-900 dark:text-white mb-4">Booking Status</h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {["pending","approved","completed","rejected","cancelled"].map((s) => (
              <div key={s} className="text-center p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                <p className="text-xl font-bold text-zinc-900 dark:text-white">{analytics.bookingStats[s] || 0}</p>
                <p className="text-xs text-zinc-500 capitalize mt-1">{s}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Property performance */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-zinc-100 dark:border-zinc-800">
          <h2 className="font-semibold text-zinc-900 dark:text-white mb-4">Property Performance</h2>
          <div className="space-y-2">
            {analytics.properties.map((p) => (
              <div key={p._id} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{p.title}</p>
                  <p className="text-xs text-zinc-500">⭐ {p.averageRating.toFixed(1)} · {p.totalReviews} reviews</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {p.isBoosted && <span className="text-[10px] bg-orange-100 dark:bg-orange-950/30 text-orange-600 px-1.5 py-0.5 rounded-full">Boosted</span>}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${p.isAvailable ? "bg-green-100 text-green-600 dark:bg-green-950/30 dark:text-green-400" : "bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"}`}>
                    {p.isAvailable ? "Active" : "Inactive"}
                  </span>
                  {p.isAvailable && <CheckCircle className="w-4 h-4 text-green-500" />}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Smart Tools */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="font-semibold text-zinc-900 dark:text-white mb-3">Smart Owner Tools</h2>
          <div className="space-y-3">
            <AutoPricingPanel authHeaders={authHeaders} />
            <BroadcastPanel authHeaders={authHeaders} properties={analytics.properties} />
          </div>
        </motion.div>

      </div>
    </div>
  );
}
