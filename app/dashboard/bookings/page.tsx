"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { useApi } from "@/hooks/useApi";
import { useRouter } from "next/navigation";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Calendar, MapPin, Check, X, DollarSign, Lock, Unlock, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import Image from "next/image";
import EcosystemServices from "@/components/booking/EcosystemServices";
import MoveInConfirmation from "@/components/booking/MoveInConfirmation";
import DisputeForm from "@/components/booking/DisputeForm";

const statusVariant: Record<string, "success" | "warning" | "danger" | "info" | "default"> = {
  approved: "success", pending: "warning", rejected: "danger", cancelled: "danger", completed: "info",
};

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function BookingsPage() {
  const { user } = useAuthStore();
  const { authHeaders } = useApi();
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"tenant" | "owner">(user?.role === "owner" ? "owner" : "tenant");

  useEffect(() => {
    if (!user) { router.push("/auth/login"); return; }
    fetchBookings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, tab]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/bookings?role=${tab}`, authHeaders());
      setBookings(data.data.bookings);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await axios.patch(`/api/bookings/${id}`, { status }, authHeaders());
      toast.success(`Booking ${status}`);
      fetchBookings();
    } catch {
      toast.error("Failed to update booking");
    }
  };

  const releaseEscrow = async (bookingId: string) => {
    try {
      await axios.post("/api/payments/release", { bookingId }, authHeaders());
      toast.success("Payment released to owner!");
      fetchBookings();
    } catch {
      toast.error("Failed to release payment");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-1">Bookings</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Manage all your booking requests</p>
        </motion.div>

        {/* Tab switcher (owners only) */}
        {user?.role === "owner" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-1 mb-6 w-fit gap-1"
          >
            {(["tenant", "owner"] as const).map((t) => (
              <motion.button
                key={t}
                onClick={() => setTab(t)}
                whileTap={{ scale: 0.96 }}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  tab === t
                    ? "bg-rose-500 text-white shadow"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                {t === "tenant" ? "My Bookings" : "Received Bookings"}
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center py-20"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full"
              />
            </motion.div>
          ) : bookings.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Calendar className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
              </motion.div>
              <p className="text-zinc-500 dark:text-zinc-400">No bookings found</p>
            </motion.div>
          ) : (
            <motion.div
              key={`bookings-${tab}`}
              variants={stagger}
              initial="hidden"
              animate="show"
              className="space-y-4"
            >
              {bookings.map((b) => (
                <motion.div
                  key={b._id}
                  variants={fadeUp}
                  whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}
                  className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row gap-4 p-4 sm:p-5">
                    {/* Property image */}
                    <div className="relative w-full sm:w-28 h-40 sm:h-24 rounded-xl overflow-hidden shrink-0">
                      <Image
                        src={b.propertyId?.images?.[0] || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400"}
                        alt={b.propertyId?.title || "Property"}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-zinc-900 dark:text-white truncate">
                          {b.propertyId?.title || "Property"}
                        </h3>
                        <Badge variant={statusVariant[b.status] || "default"} className="capitalize shrink-0 text-xs">
                          {b.status}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-3 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-2">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {format(new Date(b.startDate), "MMM d")} – {format(new Date(b.endDate), "MMM d, yyyy")}
                        </span>
                        {b.propertyId?.location?.city && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" />
                            {b.propertyId.location.city}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5" />
                          ${b.totalPrice} · {b.nights} nights
                        </span>
                      </div>

                      {/* Escrow info */}
                      {b.platformFee > 0 && (
                        <div className="flex flex-wrap items-center gap-2 text-xs mb-2">
                          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full font-medium ${
                            b.escrowStatus === "holding" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400" :
                            b.escrowStatus === "released" ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400" :
                            b.escrowStatus === "refunded" ? "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400" :
                            "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                          }`}>
                            {b.escrowStatus === "holding" ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                            Escrow: {b.escrowStatus || "none"}
                          </span>
                          <span className="flex items-center gap-1 text-zinc-400 dark:text-zinc-500">
                            <TrendingUp className="w-3 h-3" />
                            Platform: ${b.platformFee} · Owner earns: ${b.landlordEarning}
                          </span>
                        </div>
                      )}

                      {b.message && (
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 italic">&quot;{b.message}&quot;</p>
                      )}
                    </div>
                  </div>

                  {/* Owner actions */}
                  {tab === "owner" && b.status === "pending" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="flex gap-2 px-4 sm:px-5 pb-4"
                    >
                      <Button size="sm" onClick={() => updateStatus(b._id, "approved")} className="gap-1.5">
                        <Check className="w-4 h-4" /> Approve
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => updateStatus(b._id, "rejected")} className="gap-1.5">
                        <X className="w-4 h-4" /> Reject
                      </Button>
                    </motion.div>
                  )}

                  {/* Tenant actions */}
                  {tab === "tenant" && (
                    <div className="flex flex-wrap gap-2 px-4 sm:px-5 pb-4">
                      {b.status === "pending" && (
                        <Button size="sm" variant="outline" onClick={() => updateStatus(b._id, "cancelled")}>
                          Cancel Booking
                        </Button>
                      )}
                      {b.status === "approved" && b.escrowStatus === "holding" && (
                        <Button
                          size="sm"
                          onClick={() => releaseEscrow(b._id)}
                          className="gap-1.5 bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Unlock className="w-4 h-4" /> Confirm Check-in & Release Payment
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Ecosystem services */}
                  {tab === "tenant" && b.status === "approved" && (
                    <div className="px-4 sm:px-5 pb-5 space-y-3">
                      <MoveInConfirmation bookingId={b._id} onConfirmed={fetchBookings} />
                      <EcosystemServices bookingId={b._id} city={b.propertyId?.location?.city} />
                      <DisputeForm bookingId={b._id} />
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
