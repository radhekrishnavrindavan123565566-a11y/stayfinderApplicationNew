"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Users, Calendar, DollarSign, CheckCircle, Clock, AlertCircle } from "lucide-react";
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

export default function RentSplitPage() {
  const [rentSplits, setRentSplits] = useState<RentSplit[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "text-green-600 bg-green-50 dark:bg-green-900/20";
      case "pending":
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20";
      case "late":
        return "text-red-600 bg-red-50 dark:bg-red-900/20";
      default:
        return "text-zinc-600 bg-zinc-50 dark:bg-zinc-900/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "late":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
            <div className="h-96 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
              💰 Rent Split Manager
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Split rent with roommates and track payments
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow"
          >
            {showCreateForm ? "Cancel" : "+ Create Split"}
          </motion.button>
        </motion.div>

        {/* Create Form */}
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="mb-6">
              <label className="block text-sm font-semibold text-zinc-900 dark:text-white mb-3">
                Select Booking
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bookings
                  .filter((b) => b.status === "approved" || b.status === "completed")
                  .map((booking) => (
                    <motion.button
                      key={booking._id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedBooking(booking)}
                      className={cn(
                        "p-4 rounded-xl border-2 text-left transition-all",
                        selectedBooking?._id === booking._id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
                      )}
                    >
                      <p className="font-semibold text-zinc-900 dark:text-white mb-1">
                        {booking.propertyId?.title}
                      </p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        ₹{booking.totalPrice.toLocaleString()} / month
                      </p>
                    </motion.button>
                  ))}
              </div>
            </div>

            {selectedBooking && (
              <RentSplitManager
                bookingId={selectedBooking._id}
                totalRent={selectedBooking.totalPrice}
                onSave={() => {
                  setShowCreateForm(false);
                  setSelectedBooking(null);
                  fetchData();
                }}
              />
            )}
          </motion.div>
        )}

        {/* Existing Splits */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            Your Rent Splits
          </h2>

          {rentSplits.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl p-12 text-center border border-zinc-200 dark:border-zinc-800"
            >
              <div className="bg-zinc-100 dark:bg-zinc-800 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-zinc-400" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
                No rent splits yet
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                Create your first rent split to start tracking payments with roommates
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
              >
                Create Rent Split
              </motion.button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {rentSplits.map((split, index) => (
                <motion.div
                  key={split._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-xl text-zinc-900 dark:text-white mb-1">
                        {split.propertyId?.title}
                      </h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {split.propertyId?.location?.city} • {split.month}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-semibold",
                        split.status === "complete"
                          ? "bg-green-50 dark:bg-green-900/20 text-green-600"
                          : "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600"
                      )}
                    >
                      {split.status === "complete" ? "✓ Complete" : "⏳ Partial"}
                    </div>
                  </div>

                  <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">
                        Total Rent
                      </span>
                      <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                        ₹{split.totalRent.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {split.splits.map((person, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                            {person.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-zinc-900 dark:text-white">
                              {person.name}
                            </p>
                            <p className="text-xs text-zinc-500">{person.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-zinc-900 dark:text-white">
                            ₹{person.amount.toLocaleString()}
                          </p>
                          <div
                            className={cn(
                              "flex items-center gap-1 text-xs px-2 py-1 rounded-full mt-1",
                              getStatusColor(person.status)
                            )}
                          >
                            {getStatusIcon(person.status)}
                            <span className="capitalize">{person.status}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                      <Calendar className="w-4 h-4" />
                      Due: {new Date(split.dueDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                      <Users className="w-4 h-4" />
                      {split.splits.length} roommates
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
