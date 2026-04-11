"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Users, MessageSquare, Zap, Info } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookingSchema, BookingInput } from "@/lib/validations";
import { useAuthStore } from "@/store/authStore";
import { useApi } from "@/hooks/useApi";
import axios from "axios";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import { differenceInDays, format } from "date-fns";
import { useRouter } from "next/navigation";

const PLATFORM_FEE_PCT = 0.1; // 10%

interface BookingFormProps {
  propertyId: string;
  price: number;
  maxGuests: number;
  instantBooking?: boolean;
  cancellationPolicy?: "flexible" | "moderate" | "strict";
}

const POLICY_LABELS = {
  flexible: "Full refund up to 1 day before",
  moderate: "Full refund up to 5 days before",
  strict: "50% refund up to 7 days before",
};

export default function BookingForm({ propertyId, price, maxGuests, instantBooking, cancellationPolicy = "moderate" }: BookingFormProps) {
  const { user } = useAuthStore();
  const { authHeaders } = useApi();
  const router = useRouter();
  const [nights, setNights] = useState(0);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { propertyId },
  });

  const startDate = watch("startDate");
  const endDate = watch("endDate");

  const calcNights = () => {
    if (startDate && endDate) {
      const n = differenceInDays(new Date(endDate), new Date(startDate));
      setNights(n > 0 ? n : 0);
    }
  };

  const subtotal = price * nights;
  const platformFee = Math.round(subtotal * PLATFORM_FEE_PCT * 100) / 100;
  const total = subtotal + platformFee;

  const onSubmit = async (data: BookingInput) => {
    if (!user) { router.push("/auth/login"); return; }
    try {
      await axios.post("/api/bookings", data, authHeaders());
      toast.success(instantBooking ? "Booking confirmed instantly!" : "Booking request sent!");
      router.push("/dashboard/bookings");
    } catch (err) {
      if (axios.isAxiosError(err)) toast.error(err.response?.data?.error || "Booking failed");
    }
  };

  const today = format(new Date(), "yyyy-MM-dd");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-xl border border-zinc-100 p-6 sticky top-24"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-zinc-900">₹{price.toLocaleString("en-IN")}</span>
          <span className="text-zinc-500 text-sm">/ month</span>
        </div>
        {instantBooking && (
          <span className="flex items-center gap-1 text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
            <Zap className="w-3 h-3" /> Instant
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" {...register("propertyId")} />

        {/* Date picker */}
        <div className="grid grid-cols-2 gap-0 border border-zinc-200 rounded-xl overflow-hidden">
          <div className="p-3 border-r border-zinc-200">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide block mb-1">Check-in</label>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-zinc-400 shrink-0" />
              <input
                type="date"
                min={today}
                {...register("startDate")}
                onChange={(e) => { register("startDate").onChange(e); calcNights(); }}
                className="text-sm text-zinc-900 focus:outline-none w-full"
              />
            </div>
            {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate.message}</p>}
          </div>
          <div className="p-3">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide block mb-1">Check-out</label>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-zinc-400 shrink-0" />
              <input
                type="date"
                min={startDate || today}
                {...register("endDate")}
                onChange={(e) => { register("endDate").onChange(e); calcNights(); }}
                className="text-sm text-zinc-900 focus:outline-none w-full"
              />
            </div>
            {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate.message}</p>}
          </div>
        </div>

        {/* Guests */}
        <div className="border border-zinc-200 rounded-xl p-3">
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide block mb-1">Guests</label>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-zinc-400" />
            <span className="text-sm text-zinc-700">Up to {maxGuests} guests</span>
          </div>
        </div>

        {/* Message */}
        <div className="border border-zinc-200 rounded-xl p-3">
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide block mb-1">Message (optional)</label>
          <div className="flex items-start gap-2">
            <MessageSquare className="w-4 h-4 text-zinc-400 mt-0.5" />
            <textarea
              {...register("message")}
              placeholder="Tell the owner about your trip..."
              rows={2}
              className="flex-1 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Price breakdown */}
        {nights > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-2 pt-3 border-t border-zinc-100"
          >
            <div className="flex justify-between text-sm text-zinc-600">
              <span>₹{price.toLocaleString("en-IN")} × {nights} months</span>
              <span>₹{subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-sm text-zinc-500">
              <span className="flex items-center gap-1">
                Service fee (10%)
                <Info className="w-3 h-3 text-zinc-400" />
              </span>
              <span>₹{platformFee.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between font-bold text-zinc-900 pt-2 border-t border-zinc-100">
              <span>Total</span>
              <span>₹{total.toLocaleString("en-IN")}</span>
            </div>
          </motion.div>
        )}

        {/* Cancellation policy */}
        <div className="flex items-start gap-2 p-3 bg-zinc-50 rounded-xl">
          <Info className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-zinc-700 capitalize">{cancellationPolicy} cancellation</p>
            <p className="text-xs text-zinc-500 mt-0.5">{POLICY_LABELS[cancellationPolicy]}</p>
          </div>
        </div>

        <Button type="submit" isLoading={isSubmitting} className="w-full" size="lg">
          {user ? (instantBooking ? "Book Now" : "Request Booking") : "Login to Book"}
        </Button>
      </form>
    </motion.div>
  );
}
