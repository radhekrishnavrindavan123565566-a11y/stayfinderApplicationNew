"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { useEffect, useState } from "react";
import { Users, Calendar, IndianRupee, CheckCircle, Clock, AlertCircle, Plus, X, Home, TrendingUp, ArrowRight } from "lucide-react";
import RentSplitManager from "@/components/rent/RentSplitManager";
import { cn } from "@/utils/cn";

interface RentSplit {
  _id: string;
  bookingId: { _id: string };
  propertyId: { title: string; location: { city: string } };
  totalRent: number;
  splits: {
    name: string;
    email: string;
    amount: number;
    percentage: number;
    status: "pending" | "paid" | "late";
    paidAt?: Date;
  }[];
  month: string;
  dueDate: Date;
  status: "partial" | "complete";
  createdAt: Date;
}

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const fadeUp: Variants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } } };

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { icon: React.ReactNode; label: string; cls: string }> = {
    paid:     { icon: <CheckCircle className="w-3.5 h-3.5" />, label: "Paid",    cls: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" },
    pending:  { icon: <Clock       className="w-3.5 h-3.5" />, label: "Pending", cls: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800" },
    late:     { icon: <AlertCircle className="w-3.5 h-3.5" />, label: "Late",    cls: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800" },
    complete: { icon: <CheckCircle className="w-3.5 h-3.5" />, label: "Complete",cls: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" },
    partial:  { icon: <Clock       className="w-3.5 h-3.5" />, label: "Partial", cls: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800" },
  };
  const s = map[status] ?? map.pending;
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border", s.cls)}>
      {s.icon}{s.label}
    </span>
  );
}

export default function RentSplitPage() {
  const [rentSplits, setRentSplits] = useState<RentSplit[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [splitsRes, bookingsRes] = await Promise.all([
        fetch("/api/rent-split"),
        fetch("/api/bookings"),
      ]);
      const splitsData = await splitsRes.json();
      const bookingsData = await bookingsRes.json();
      setRentSplits(splitsData.rentSplits || []);
      setBookings(bookingsData.bookings || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalRent = rentSplits.reduce((s, r) => s + r.totalRent, 0);
  const paidCount = rentSplits.filter(r => r.status === "complete").length;
  const pendingCount = rentSplits.filter(r => r.status === "partial").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-20 pb-16">
        <div className="max-w-5xl mx-auto px-4 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-500/25">
                <IndianRupee className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">Rent Split</h1>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 ml-13 pl-1">Split rent with roommates and track payments</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => { setShowCreateForm(!showCreateForm); setSelectedBooking(null); }}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg",
              showCreateForm
                ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                : "bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-rose-500/25 hover:shadow-rose-500/40"
            )}
          >
            {showCreateForm ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> Create Split</>}
          </motion.button>
        </motion.div>

        {/* ── Stats strip ── */}
        {rentSplits.length > 0 && (
          <motion.div variants={stagger} initial="hidden" animate="show"
            className="grid grid-cols-3 gap-3 sm:gap-4">
            {[
              { label: "Total Managed", value: `₹${totalRent.toLocaleString("en-IN")}`, icon: <IndianRupee className="w-5 h-5" />, grad: "from-rose-500 to-amber-500" },
              { label: "Completed",     value: paidCount,    icon: <CheckCircle className="w-5 h-5" />, grad: "from-emerald-500 to-teal-500" },
              { label: "Pending",       value: pendingCount, icon: <Clock className="w-5 h-5" />,       grad: "from-amber-500 to-orange-500" },
            ].map((s) => (
              <motion.div key={s.label} variants={fadeUp}
                className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800 shadow-sm">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.grad} flex items-center justify-center text-white mb-3 shadow-md`}>
                  {s.icon}
                </div>
                <p className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">{s.value}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ── Create Form ── */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-gradient-to-r from-rose-50 to-amber-50 dark:from-rose-950/20 dark:to-amber-950/20">
                <h2 className="font-bold text-zinc-900 dark:text-white">New Rent Split</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Select a booking to split rent</p>
              </div>
              <div className="p-5 space-y-4">
                {bookings.filter(b => b.status === "approved" || b.status === "completed").length === 0 ? (
                  <div className="text-center py-8 text-zinc-400">
                    <Home className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No approved bookings found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {bookings.filter(b => b.status === "approved" || b.status === "completed").map((booking) => (
                      <motion.button key={booking._id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedBooking(booking)}
                        className={cn(
                          "p-4 rounded-xl border-2 text-left transition-all",
                          selectedBooking?._id === booking._id
                            ? "border-rose-500 bg-rose-50 dark:bg-rose-950/20"
                            : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
                        )}
                      >
                        <p className="font-semibold text-sm text-zinc-900 dark:text-white truncate">{booking.propertyId?.title}</p>
                        <p className="text-xs text-zinc-500 mt-1">₹{booking.totalPrice?.toLocaleString("en-IN")} / month</p>
                      </motion.button>
                    ))}
                  </div>
                )}
                {selectedBooking && (
                  <RentSplitManager
                    bookingId={selectedBooking._id}
                    totalRent={selectedBooking.totalPrice}
                    onSave={() => { setShowCreateForm(false); setSelectedBooking(null); fetchData(); }}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Splits list ── */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">Your Rent Splits</h2>

          {rentSplits.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-100 to-amber-100 dark:from-rose-900/30 dark:to-amber-900/30 flex items-center justify-center mx-auto mb-5">
                <Users className="w-9 h-9 text-rose-400" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">No rent splits yet</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 max-w-xs mx-auto">
                Create your first rent split to start tracking payments with roommates
              </p>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-rose-500 to-amber-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 transition-shadow">
                <Plus className="w-4 h-4" /> Create Rent Split
              </motion.button>
            </motion.div>
          ) : (
            <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
              {rentSplits.map((split, index) => {
                const paidAmt = split.splits.filter(s => s.status === "paid").reduce((a, s) => a + s.amount, 0);
                const pct = Math.round((paidAmt / split.totalRent) * 100);
                return (
                  <motion.div key={split._id} variants={fadeUp}
                    className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                    {/* Card header */}
                    <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-bold text-zinc-900 dark:text-white truncate">{split.propertyId?.title}</h3>
                        <p className="text-xs text-zinc-500 mt-0.5">{split.propertyId?.location?.city} · {split.month}</p>
                      </div>
                      <StatusBadge status={split.status} />
                    </div>

                    <div className="p-5 space-y-4">
                      {/* Amount + progress */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-zinc-500 mb-0.5">Total Rent</p>
                          <p className="text-2xl font-black text-zinc-900 dark:text-white">₹{split.totalRent.toLocaleString("en-IN")}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-zinc-500 mb-0.5">Collected</p>
                          <p className="text-lg font-bold text-emerald-600">₹{paidAmt.toLocaleString("en-IN")}</p>
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full" />
                      </div>
                      <p className="text-xs text-zinc-400">{pct}% collected</p>

                      {/* Roommates */}
                      <div className="space-y-2">
                        {split.splits.map((person, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-400 to-amber-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                {person.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-sm text-zinc-900 dark:text-white truncate">{person.name}</p>
                                <p className="text-[11px] text-zinc-400 truncate">{person.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <p className="font-bold text-sm text-zinc-900 dark:text-white">₹{person.amount.toLocaleString("en-IN")}</p>
                              <StatusBadge status={person.status} />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-400">
                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Due {new Date(split.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                        <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{split.splits.length} roommates</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
