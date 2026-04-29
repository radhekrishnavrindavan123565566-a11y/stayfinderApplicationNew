"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { IndianRupee, CheckCircle, Clock, AlertCircle, Calendar, Home } from "lucide-react";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useApi } from "@/hooks/useApi";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import { format } from "date-fns";

interface Payment {
  _id: string;
  month: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: "pending" | "paid" | "late" | "waived";
  isOverdue?: boolean;
  note?: string;
  propertyId?: { title: string; images: string[]; location: { city: string } };
  tenantId?: { username: string; avatar?: string };
}

interface Stats { total: number; paid: number; pending: number; late: number; totalAmount: number }

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
  late: "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400",
  waived: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  paid: <CheckCircle className="w-4 h-4" />,
  pending: <Clock className="w-4 h-4" />,
  late: <AlertCircle className="w-4 h-4" />,
  waived: <CheckCircle className="w-4 h-4" />,
};

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

export default function RentTrackerPage() {
  const { ready, user } = useRequireAuth();
  const { authHeaders } = useApi();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [tab, setTab] = useState<"all" | "pending" | "paid">("all");

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const role = user.role === "owner" ? "owner" : "tenant";
      const { data } = await axios.get(`/api/rent-tracker?role=${role}`, authHeaders());
      setPayments(data.data.payments);
      setStats(data.data.stats);
    } catch { toast.error("Failed to load payments"); }
    finally { setLoading(false); }
  }, [user, authHeaders]);

  useEffect(() => {
    if (!ready || !user) return;
    load();
  }, [ready, user, load]);

  const confirmPayment = async (paymentId: string, status: "paid" | "late" | "waived") => {
    setConfirming(paymentId);
    try {
      await axios.patch("/api/rent-tracker", { paymentId, status }, authHeaders());
      toast.success(status === "paid" ? "Payment confirmed!" : "Status updated");
      load();
    } catch { toast.error("Failed to update"); }
    finally { setConfirming(null); }
  };

  const filtered = payments.filter((p) => {
    if (tab === "pending") return p.status === "pending" || p.status === "late";
    if (tab === "paid") return p.status === "paid";
    return true;
  });

  if (!ready || !user) return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-20 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-rose-500 border-t-transparent" />
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <IndianRupee className="w-7 h-7 text-rose-500" /> Rent Tracker
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            {user.role === "owner" ? "Track rent payments from your tenants" : "Track your monthly rent payments"}
          </p>
        </motion.div>

        {/* Stats */}
        {stats && (
          <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total", value: stats.total, icon: <Calendar className="w-4 h-4" />, color: "bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400" },
              { label: "Paid", value: stats.paid, icon: <CheckCircle className="w-4 h-4" />, color: "bg-green-100 text-green-600 dark:bg-green-950/30 dark:text-green-400" },
              { label: "Pending", value: stats.pending, icon: <Clock className="w-4 h-4" />, color: "bg-amber-100 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400" },
              { label: "Collected", value: `₹${stats.totalAmount.toLocaleString("en-IN")}`, icon: <IndianRupee className="w-4 h-4" />, color: "bg-rose-100 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400" },
            ].map((s) => (
              <motion.div key={s.label} variants={fadeUp} whileHover={{ y: -2 }}
                className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800 shadow-sm">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${s.color}`}>{s.icon}</div>
                <p className="text-xl font-bold text-zinc-900 dark:text-white">{s.value}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-1 gap-1 w-fit">
          {(["all", "pending", "paid"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                tab === t ? "bg-rose-500 text-white shadow" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}>
              {t}
            </button>
          ))}
        </div>

        {/* Payment list */}
        {loading ? (
          <div className="flex justify-center py-16">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full" />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <div className="text-5xl mb-3">📋</div>
            <p className="text-zinc-500 dark:text-zinc-400">No payments found</p>
            {payments.length === 0 && (
              <p className="text-xs text-zinc-400 mt-2">Payments are generated automatically when a booking is active</p>
            )}
          </motion.div>
        ) : (
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
            {filtered.map((p) => (
              <motion.div key={p._id} variants={fadeUp}
                className={`bg-white dark:bg-zinc-900 rounded-2xl border shadow-sm p-4 flex items-center gap-4 ${
                  p.isOverdue ? "border-red-200 dark:border-red-900" : "border-zinc-100 dark:border-zinc-800"
                }`}>
                {/* Property */}
                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/30 flex items-center justify-center flex-shrink-0">
                  <Home className="w-5 h-5 text-rose-500" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-zinc-900 dark:text-white text-sm truncate">
                    {p.propertyId?.title || "Property"}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="text-xs text-zinc-500">{format(new Date(p.month + "-01"), "MMMM yyyy")}</span>
                    <span className="text-xs text-zinc-400">Due: {format(new Date(p.dueDate), "MMM d")}</span>
                    {p.paidDate && <span className="text-xs text-green-600">Paid: {format(new Date(p.paidDate), "MMM d")}</span>}
                    {user.role === "owner" && p.tenantId && (
                      <span className="text-xs text-zinc-400">Tenant: {p.tenantId.username}</span>
                    )}
                  </div>
                  {p.note && <p className="text-xs text-zinc-400 mt-0.5 italic">{p.note}</p>}
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <p className="font-bold text-zinc-900 dark:text-white">₹{p.amount.toLocaleString("en-IN")}</p>
                  <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full capitalize ${STATUS_STYLES[p.status]}`}>
                    {STATUS_ICONS[p.status]} {p.isOverdue && p.status === "pending" ? "Overdue" : p.status}
                  </span>
                  {user.role === "owner" && p.status === "pending" && (
                    <Button size="sm" onClick={() => confirmPayment(p._id, "paid")}
                      isLoading={confirming === p._id} className="text-xs px-3 py-1.5">
                      Confirm
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
