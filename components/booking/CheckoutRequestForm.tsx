"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, AlertCircle, DollarSign } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "@/components/ui/Button";
import axios from "axios";
import toast from "react-hot-toast";
import { useApi } from "@/hooks/useApi";
import { format, differenceInCalendarMonths } from "date-fns";

const checkoutSchema = z.object({
  checkoutDate: z.string().min(1, "Checkout date required"),
  reason: z.string().min(10, "Please provide reason (min 10 chars)").max(500),
});

type CheckoutInput = z.infer<typeof checkoutSchema>;

interface CheckoutRequestFormProps {
  bookingId: string;
  monthlyPrice: number;
  startDate: string;
  onSubmitted?: () => void;
}

export default function CheckoutRequestForm({ bookingId, monthlyPrice, startDate, onSubmitted }: CheckoutRequestFormProps) {
  const { authHeaders } = useApi();
  const [submitted, setSubmitted] = useState(false);
  const [calculatedRent, setCalculatedRent] = useState(0);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
  });

  const checkoutDate = watch("checkoutDate");

  // Calculate final rent based on checkout date
  const calculateRent = () => {
    if (checkoutDate && startDate) {
      const start = new Date(startDate);
      const checkout = new Date(checkoutDate);
      
      if (checkout > start) {
        const months = differenceInCalendarMonths(checkout, start);
        const finalRent = monthlyPrice * months;
        setCalculatedRent(finalRent);
      }
    }
  };

  const onSubmit = async (data: CheckoutInput) => {
    try {
      await axios.post(`/api/bookings/${bookingId}/checkout-request`, 
        {
          checkoutDate: data.checkoutDate,
          reason: data.reason,
          calculatedRent,
        },
        authHeaders()
      );
      toast.success("Checkout request submitted!");
      setSubmitted(true);
      onSubmitted?.();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.error || "Failed to submit request");
      }
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-2xl p-4 sm:p-5 text-center"
      >
        <p className="text-green-700 dark:text-green-400 font-medium mb-1">Checkout request submitted</p>
        <p className="text-green-600 dark:text-green-500 text-sm">Owner will review your request soon</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="bg-zinc-50 dark:bg-zinc-800 rounded-2xl p-4 sm:p-5 border border-zinc-200 dark:border-zinc-700"
    >
      <h3 className="font-semibold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
        <Calendar className="w-4 h-4" />
        Request for Checkout
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {/* Checkout date */}
        <div>
          <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wide mb-1.5">
            Planned Checkout Date
          </label>
          <input
            type="date"
            {...register("checkoutDate")}
            onChange={(e) => {
              register("checkoutDate").onChange(e);
              calculateRent();
            }}
            min={format(new Date(), "yyyy-MM-dd")}
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
          {errors.checkoutDate && (
            <p className="text-xs text-red-500 mt-1">{errors.checkoutDate.message}</p>
          )}
        </div>

        {/* Final rent calculator */}
        {calculatedRent > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-zinc-900 rounded-xl p-3 border border-zinc-200 dark:border-zinc-700"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                <DollarSign className="w-4 h-4" />
                Final Rent (until checkout)
              </span>
              <span className="font-bold text-zinc-900 dark:text-white">₹{calculatedRent.toLocaleString("en-IN")}</span>
            </div>
          </motion.div>
        )}

        {/* Reason */}
        <div>
          <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wide mb-1.5">
            Reason for Checkout
          </label>
          <textarea
            {...register("reason")}
            placeholder="Tell owner why you're checking out..."
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
          />
          {errors.reason && (
            <p className="text-xs text-red-500 mt-1">{errors.reason.message}</p>
          )}
        </div>

        {/* Info */}
        <div className="flex gap-2 p-2.5 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-600 dark:text-blue-400">
            Owner will review your request. Final settlement will be calculated based on the checkout date.
          </p>
        </div>

        <Button type="submit" isLoading={isSubmitting} className="w-full">
          Submit Checkout Request
        </Button>
      </form>
    </motion.div>
  );
}
