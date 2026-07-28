"use client";

import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useApi } from "@/hooks/useApi";
import {
  Calendar,
  MapPin,
  Home,
  LogOut,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";
import BackButton from "@/components/ui/BackButton";
import CheckoutNotificationModal from "@/components/booking/CheckoutNotificationModal";
import { notifySuccess, notifyError } from "@/lib/notifications";

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

interface Booking {
  _id: string;
  propertyId: {
    title: string;
    images: string[];
    location: {
      address: string;
      city: string;
    };
  };
  ownerId: {
    _id: string;
    username: string;
  };
  checkInDate: string;
  checkOutDate: string;
  checkoutNotificationSent?: boolean;
  checkoutDate?: string;
  checkoutReason?: string;
  status: string;
  totalPrice: number;
  rentalDays: number;
}

export default function CheckoutPage() {
  const { ready, user } = useRequireAuth();
  const { authHeaders } = useApi();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!ready || !user) return;
    fetchBookings();
  }, [ready, user]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `/api/bookings?role=tenant&status=approved`,
        authHeaders()
      );
      setBookings(data.data.bookings);
    } catch (error) {
      notifyError("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckoutClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedBooking(null);
    fetchBookings();
  };

  if (!ready || !user) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-rose-500 border-t-transparent" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-rose-500 border-t-transparent" />
      </div>
    );
  }

  const activeBookings = bookings.filter(
    (b) =>
      b.status === "approved" &&
      !b.checkoutNotificationSent &&
      new Date(b.checkOutDate) > new Date()
  );

  const checkoutRequested = bookings.filter(
    (b) => b.checkoutNotificationSent && b.checkoutDate
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8 pt-6"
        >
          <BackButton />
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <LogOut className="w-8 h-8 text-amber-500" />
              Checkout Management
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">
              Manage your room exits and notify owners
            </p>
          </div>
        </motion.div>

        {/* Info Alert */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 flex gap-3"
        >
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Notify your owner before checkout:</strong> Send a checkout notification to inform
            your owner about your plan to vacate. This helps them prepare for the next tenant.
          </div>
        </motion.div>

        {/* Active Bookings */}
        {activeBookings.length > 0 && (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="mb-8"
          >
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <Home className="w-6 h-6 text-rose-500" />
              Active Bookings ({activeBookings.length})
            </h2>

            <div className="grid gap-4">
              {activeBookings.map((booking, idx) => (
                <motion.div
                  key={booking._id}
                  variants={fadeUp}
                  className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="p-6 flex flex-col sm:flex-row gap-6">
                    {/* Image */}
                    <div className="w-full sm:w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-200 dark:bg-zinc-800">
                      {booking.propertyId?.images?.[0] ? (
                        <img
                          src={booking.propertyId.images[0]}
                          alt={booking.propertyId.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Home className="w-8 h-8 text-zinc-400" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                          {booking.propertyId?.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                          <MapPin className="w-4 h-4" />
                          {booking.propertyId?.location?.address},{" "}
                          {booking.propertyId?.location?.city}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-zinc-500 dark:text-zinc-400">Check-In</p>
                          <p className="font-semibold text-zinc-900 dark:text-white">
                            {format(new Date(booking.checkInDate), "MMM dd, yyyy")}
                          </p>
                        </div>
                        <div>
                          <p className="text-zinc-500 dark:text-zinc-400">Check-Out</p>
                          <p className="font-semibold text-zinc-900 dark:text-white">
                            {format(new Date(booking.checkOutDate), "MMM dd, yyyy")}
                          </p>
                        </div>
                        <div>
                          <p className="text-zinc-500 dark:text-zinc-400">Duration</p>
                          <p className="font-semibold text-zinc-900 dark:text-white">
                            {booking.rentalDays} days
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                          Owner: {booking.ownerId?.username}
                        </p>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex items-center justify-end">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleCheckoutClick(booking)}
                        className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap"
                      >
                        <LogOut className="w-4 h-4" />
                        Request Checkout
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Checkout Requested */}
        {checkoutRequested.length > 0 && (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="mb-8"
          >
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              Checkout Requested ({checkoutRequested.length})
            </h2>

            <div className="grid gap-4">
              {checkoutRequested.map((booking) => (
                <motion.div
                  key={booking._id}
                  variants={fadeUp}
                  className="bg-white dark:bg-zinc-900 rounded-xl border border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 overflow-hidden"
                >
                  <div className="p-6 flex flex-col sm:flex-row gap-6">
                    {/* Image */}
                    <div className="w-full sm:w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-200 dark:bg-zinc-800">
                      {booking.propertyId?.images?.[0] ? (
                        <img
                          src={booking.propertyId.images[0]}
                          alt={booking.propertyId.title}
                          className="w-full h-full object-cover opacity-75"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Home className="w-8 h-8 text-zinc-400" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                          {booking.propertyId?.title}
                          <span className="px-2 py-1 text-xs font-semibold bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-full">
                            Checkout Requested
                          </span>
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                          <MapPin className="w-4 h-4" />
                          {booking.propertyId?.location?.address},{" "}
                          {booking.propertyId?.location?.city}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-zinc-500 dark:text-zinc-400">Requested Date</p>
                          <p className="font-semibold text-zinc-900 dark:text-white flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {booking.checkoutDate
                              ? format(new Date(booking.checkoutDate), "MMM dd, yyyy")
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-zinc-500 dark:text-zinc-400">Reason</p>
                          <p className="font-semibold text-zinc-900 dark:text-white capitalize">
                            {booking.checkoutReason || "Not specified"}
                          </p>
                        </div>
                        <div>
                          <p className="text-zinc-500 dark:text-zinc-400">Status</p>
                          <p className="font-semibold text-green-600 dark:text-green-400 flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Awaiting Confirmation
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {activeBookings.length === 0 && checkoutRequested.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <Home className="w-16 h-16 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">
              No active bookings
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
              You don't have any active room bookings to checkout from. Once you have an active booking,
              you can request checkout from here.
            </p>
          </motion.div>
        )}
      </div>

      {/* Checkout Modal */}
      {selectedBooking && (
        <CheckoutNotificationModal
          isOpen={showModal}
          onClose={handleModalClose}
          bookingId={selectedBooking._id}
          propertyTitle={selectedBooking.propertyId?.title || "Property"}
          ownerId={selectedBooking.ownerId?._id || ""}
          ownerName={selectedBooking.ownerId?.username || "Owner"}
          currentCheckoutDate={selectedBooking.checkoutDate}
        />
      )}
    </div>
  );
}
