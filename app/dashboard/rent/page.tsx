"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Bell,
  CheckCircle,
  Clock,
  Download,
  CreditCard,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAuthStore } from "@/store/authStore";
import axios from "axios";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";

interface RentPayment {
  _id: string;
  booking: {
    _id: string;
    property: { title: string; _id: string };
    monthlyRent: number;
  };
  amount: number;
  month: string;
  year: number;
  dueDate: string;
  paidDate?: string;
  status: "pending" | "paid" | "overdue";
  paymentMethod?: string;
  transactionId?: string;
}

interface ReminderSettings {
  enabled: boolean;
  daysBeforeDue: number;
}

export default function RentRemindersPage() {
  const { ready, user: authUser } = useRequireAuth();
  const { accessToken } = useAuthStore();
  const [payments, setPayments] = useState<RentPayment[]>([]);
  const [upcomingPayment, setUpcomingPayment] = useState<RentPayment | null>(null);
  const [loading, setLoading] = useState(true);
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>({
    enabled: true,
    daysBeforeDue: 5,
  });
  const [paymentStreak, setPaymentStreak] = useState(0);

  const fetchPayments = useCallback(async () => {
    if (!accessToken) return;
    try {
      const { data } = await axios.get("/api/rent-tracker", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      const allPayments = data.data || [];
      setPayments(allPayments);

      // Find upcoming payment
      const pending = allPayments.find((p: RentPayment) => p.status === "pending");
      setUpcomingPayment(pending || null);

      // Calculate payment streak
      const paidPayments = allPayments.filter((p: RentPayment) => p.status === "paid");
      setPaymentStreak(paidPayments.length);
    } catch (error) {
      console.error("Failed to fetch payments:", error);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  const fetchReminderSettings = useCallback(async () => {
    if (!accessToken) return;
    try {
      const { data } = await axios.get("/api/rent-reminders", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (data.data) {
        setReminderSettings(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch reminder settings:", error);
    }
  }, [accessToken]);

  useEffect(() => {
    if (ready && authUser && accessToken) {
      fetchPayments();
      fetchReminderSettings();
    }
  }, [ready, authUser, accessToken, fetchPayments, fetchReminderSettings]);

  const handleUpdateReminders = async (days: number) => {
    if (!accessToken) return;
    try {
      await axios.post(
        "/api/rent-reminders",
        { daysBeforeDue: days, enabled: true },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setReminderSettings({ enabled: true, daysBeforeDue: days });
      toast.success("Reminder settings updated");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update settings");
    }
  };

  const handleLogPayment = async () => {
    if (!upcomingPayment || !accessToken) return;

    const transactionId = prompt("Enter UPI Transaction ID (12 digits):");
    if (!transactionId) return;

    if (!/^\d{12}$/.test(transactionId)) {
      toast.error("Transaction ID must be 12 digits");
      return;
    }

    try {
      await axios.post(
        "/api/rent-tracker",
        {
          bookingId: upcomingPayment.booking._id,
          amount: upcomingPayment.amount,
          month: upcomingPayment.month,
          year: upcomingPayment.year,
          paymentMethod: "upi",
          transactionId,
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      toast.success("Payment logged successfully");
      fetchPayments();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to log payment");
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatMonth = (month: string, year: number) => {
    return `${month} ${year}`;
  };

  if (!ready || !authUser) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-rose-500 border-t-transparent" />
      </div>
    );
  }

  const daysUntilDue = upcomingPayment ? getDaysUntilDue(upcomingPayment.dueDate) : null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-20 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white mb-2">
            Rent Reminders
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Never miss a rent payment deadline
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Upcoming Payment */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-3xl p-6 text-white"
          >
            {upcomingPayment ? (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5" />
                  <span className="text-sm font-medium opacity-90">Next Payment</span>
                </div>
                <h2 className="text-4xl font-black mb-2">
                  ₹{upcomingPayment.amount.toFixed(0)}
                </h2>
                <p className="text-emerald-50 mb-4">
                  {upcomingPayment.booking.property.title}
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-75">Due Date</p>
                    <p className="font-bold">{formatDate(upcomingPayment.dueDate)}</p>
                    {daysUntilDue !== null && (
                      <p className="text-xs opacity-75 mt-1">
                        {daysUntilDue > 0
                          ? `${daysUntilDue} days remaining`
                          : daysUntilDue === 0
                          ? "Due today!"
                          : `${Math.abs(daysUntilDue)} days overdue`}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={handleLogPayment}
                    className="bg-white text-emerald-600 hover:bg-emerald-50"
                  >
                    <CreditCard className="w-4 h-4" />
                    Pay Now
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-75" />
                <p className="font-semibold">All caught up!</p>
                <p className="text-sm opacity-75">No pending rent payments</p>
              </div>
            )}
          </motion.div>

          {/* Payment Streak */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Payment Streak
              </span>
            </div>
            <p className="text-4xl font-black text-zinc-900 dark:text-white mb-2">
              {paymentStreak}
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Consecutive payments
            </p>
            {paymentStreak >= 6 && (
              <div className="mt-4 px-3 py-2 bg-amber-50 dark:bg-amber-950/30 rounded-xl">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                  <span>🏆</span> Perfect Payment Record!
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Reminder Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-purple-500" />
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              Reminder Settings
            </h2>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
            Get notified before your rent is due
          </p>
          <div className="flex flex-wrap gap-3">
            {[3, 5, 7].map((days) => (
              <button
                key={days}
                onClick={() => handleUpdateReminders(days)}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                  reminderSettings.daysBeforeDue === days
                    ? "bg-purple-500 text-white"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                {days} days before
              </button>
            ))}
          </div>
        </motion.div>

        {/* Payment History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">
            Payment History
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-rose-500 border-t-transparent" />
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                No payment history
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400">
                Your rent payments will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((payment, index) => (
                <motion.div
                  key={payment._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          payment.status === "paid"
                            ? "bg-green-100 dark:bg-green-950/30"
                            : payment.status === "overdue"
                            ? "bg-red-100 dark:bg-red-950/30"
                            : "bg-amber-100 dark:bg-amber-950/30"
                        }`}
                      >
                        {payment.status === "paid" ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : payment.status === "overdue" ? (
                          <AlertCircle className="w-6 h-6 text-red-600" />
                        ) : (
                          <Clock className="w-6 h-6 text-amber-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-zinc-900 dark:text-white">
                          {formatMonth(payment.month, payment.year)}
                        </h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 truncate">
                          {payment.booking.property.title}
                        </p>
                        {payment.paidDate && (
                          <p className="text-xs text-zinc-500 mt-1">
                            Paid on {formatDate(payment.paidDate)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-zinc-900 dark:text-white">
                        ₹{payment.amount.toFixed(0)}
                      </p>
                      <p
                        className={`text-xs font-semibold capitalize ${
                          payment.status === "paid"
                            ? "text-green-600"
                            : payment.status === "overdue"
                            ? "text-red-600"
                            : "text-amber-600"
                        }`}
                      >
                        {payment.status}
                      </p>
                      {payment.status === "paid" && payment.transactionId && (
                        <button
                          onClick={() => toast.success("Receipt download coming soon!")}
                          className="mt-2 text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          Receipt
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
