"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Calendar, AlertCircle, CheckCircle } from "lucide-react";
import axios from "axios";
import { useApi } from "@/hooks/useApi";
import { notifySuccess, notifyError, confirmDelete } from "@/lib/notifications";
import toast from "react-hot-toast";

interface CheckoutNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  propertyTitle: string;
  ownerId: string;
  ownerName: string;
  currentCheckoutDate?: string;
}

export default function CheckoutNotificationModal({
  isOpen,
  onClose,
  bookingId,
  propertyTitle,
  ownerId,
  ownerName,
  currentCheckoutDate,
}: CheckoutNotificationModalProps) {
  const { authHeaders } = useApi();
  const [step, setStep] = useState<"confirm" | "form" | "success">("confirm");
  const [checkoutDate, setCheckoutDate] = useState(currentCheckoutDate || "");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!checkoutDate) {
      notifyError("Please select a checkout date");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(
        `/api/bookings/${bookingId}/notify-checkout`,
        {
          checkoutDate,
          reason,
          message,
          propertyTitle,
          ownerId,
          ownerName,
        },
        authHeaders()
      );

      notifySuccess("Checkout notification sent to owner!");
      setStep("success");

      setTimeout(() => {
        onClose();
        setStep("confirm");
      }, 2000);
    } catch (error) {
      notifyError("Failed to send notification");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep("confirm");
    setCheckoutDate(currentCheckoutDate || "");
    setReason("");
    setMessage("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
          >
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  Checkout Request
                </h3>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-6 space-y-4">
                {step === "confirm" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <p className="text-sm text-amber-800 dark:text-amber-300">
                        <strong>Property:</strong> {propertyTitle}
                      </p>
                      <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                        <strong>Owner:</strong> {ownerName}
                      </p>
                    </div>

                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      You're about to send a checkout notification to the owner. This will inform them that you're planning to vacate the room.
                    </p>

                    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 space-y-2">
                      <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        What happens next:
                      </p>
                      <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1 ml-6 list-disc">
                        <li>Owner receives notification about your checkout</li>
                        <li>You can provide checkout date & reason</li>
                        <li>Final rent calculator will be updated</li>
                        <li>Owner can follow up with you</li>
                      </ul>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setStep("form")}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium rounded-lg transition-all"
                      >
                        Continue
                      </button>
                      <button
                        onClick={handleClose}
                        className="flex-1 px-4 py-2.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === "form" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {/* Checkout Date */}
                    <div>
                      <label className="block text-sm font-semibold text-zinc-900 dark:text-white mb-2">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Checkout Date
                      </label>
                      <input
                        type="date"
                        value={checkoutDate}
                        onChange={(e) => setCheckoutDate(e.target.value)}
                        min={getTodayDate()}
                        className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        Select the date you plan to leave
                      </p>
                    </div>

                    {/* Reason */}
                    <div>
                      <label className="block text-sm font-semibold text-zinc-900 dark:text-white mb-2">
                        Reason for Checkout (Optional)
                      </label>
                      <select
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="">Select a reason...</option>
                        <option value="relocation">Relocating</option>
                        <option value="work-change">Work change/Transfer</option>
                        <option value="family">Family reasons</option>
                        <option value="lease-end">Lease end</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-semibold text-zinc-900 dark:text-white mb-2">
                        Message to Owner (Optional)
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Add any additional details or feedback..."
                        rows={3}
                        className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                      />
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        {message.length}/200 characters
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !checkoutDate}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Send Notification
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setStep("confirm")}
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-2.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
                      >
                        Back
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === "success" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4 text-center py-4"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 0.5, repeat: 1 }}
                      className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto"
                    >
                      <CheckCircle className="w-8 h-8 text-white" />
                    </motion.div>
                    <div>
                      <h4 className="text-lg font-bold text-zinc-900 dark:text-white">
                        Notification Sent!
                      </h4>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                        {ownerName} has been notified about your checkout
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
