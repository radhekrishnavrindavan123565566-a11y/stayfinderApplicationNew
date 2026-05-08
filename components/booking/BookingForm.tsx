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
import { differenceInCalendarMonths, format } from "date-fns";
import { useRouter } from "next/navigation";

const PLATFORM_FEE_PCT = 0.1; // 10%

interface BookingFormProps {
  propertyId: string;
  price: number;
  maxGuests: number;
  instantBooking?: boolean;
  cancellationPolicy?: "flexible" | "moderate" | "strict";
  propertyType?: string;
  ownerId?: string;
}

// Hotel/Resort = daily pricing; everything else = monthly
const DAILY_TYPES = ["villa", "cabin"];
const DAILY_LABEL: Record<string, string> = { villa: "night", cabin: "night" };

const POLICY_LABELS = {
  flexible: "Full refund up to 1 day before",
  moderate: "Full refund up to 5 days before",
  strict: "50% refund up to 7 days before",
};

export default function BookingForm({ propertyId, price, maxGuests, instantBooking, cancellationPolicy = "moderate", propertyType = "apartment", ownerId }: BookingFormProps) {
  const { user } = useAuthStore();
  const { authHeaders } = useApi();
  const router = useRouter();
  const isDaily = DAILY_TYPES.includes(propertyType);
  const unit = isDaily ? (DAILY_LABEL[propertyType] || "night") : "month";
  const [duration, setDuration] = useState(0); // months or nights

  // Block owner from seeing booking form
  if (user && ownerId && user._id === ownerId) {
    return (
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 text-center">
        <p className="text-amber-700 dark:text-amber-400 text-sm font-medium">This is your property — you cannot book it.</p>
      </div>
    );
  }

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { propertyId },
  });

  const startDate = watch("startDate");
  const endDate = watch("endDate");

  const calcDuration = () => {
    if (startDate && endDate) {
      if (isDaily) {
        const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
        setDuration(days > 0 ? days : 0);
      } else {
        const m = differenceInCalendarMonths(new Date(endDate), new Date(startDate));
        setDuration(m > 0 ? m : 0);
      }
    }
  };

  const subtotal = price * duration;
  const platformFee = Math.round(subtotal * PLATFORM_FEE_PCT * 100) / 100;
  const total = subtotal + platformFee;

  const onSubmit = async (data: BookingInput) => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    try {
      await axios.post("/api/bookings", data, authHeaders());
      toast.success(instantBooking ? "Booking confirmed instantly!" : "Booking request sent!");
      router.push("/dashboard/bookings");
    } catch (err) {
      if (axios.isAxiosError(err)) toast.error(err.response?.data?.error || "Booking failed");
    }
  };

  const [today] = useState(() => format(new Date(), "yyyy-MM-dd"));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800 p-6 sticky top-24"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-zinc-900 dark:text-white">₹{price.toLocaleString("en-IN")}</span>
          <span className="text-zinc-500 dark:text-zinc-400 text-sm">/ {unit}</span>
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
        <div className="grid grid-cols-2 gap-0 border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
          <div className="p-3 border-r border-zinc-200 dark:border-zinc-700">
            <label htmlFor="startDate" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide block mb-1">Check-in</label>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-zinc-400 shrink-0 pointer-events-none" />
              <input
                id="startDate"
                type="date"
                min={today}
                {...register("startDate")}
                onChange={(e) => { register("startDate").onChange(e); calcDuration(); }}
                placeholder="dd-mm-yyyy"
                className="text-sm text-zinc-900 dark:text-white bg-transparent focus:outline-none w-full cursor-pointer [color-scheme:light] dark:[color-scheme:dark]"
                style={{ colorScheme: 'auto' }}
              />
            </div>
            {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate.message}</p>}
          </div>
          <div className="p-3">
            <label htmlFor="endDate" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide block mb-1">Check-out</label>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-zinc-400 shrink-0 pointer-events-none" />
              <input
                id="endDate"
                type="date"
                min={startDate || today}
                {...register("endDate")}
                onChange={(e) => { register("endDate").onChange(e); calcDuration(); }}
                placeholder="dd-mm-yyyy"
                className="text-sm text-zinc-900 dark:text-white bg-transparent focus:outline-none w-full cursor-pointer [color-scheme:light] dark:[color-scheme:dark]"
                style={{ colorScheme: 'auto' }}
              />
            </div>
            {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate.message}</p>}
          </div>
        </div>

        {/* Guests */}
        <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-3">
          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide block mb-1">Guests</label>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-zinc-400" />
            <span className="text-sm text-zinc-700 dark:text-zinc-300">Up to {maxGuests} guests</span>
          </div>
        </div>

        {/* Message */}
        <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-3">
          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide block mb-1">Message (optional)</label>
          <div className="flex items-start gap-2">
            <MessageSquare className="w-4 h-4 text-zinc-400 mt-0.5" />
            <textarea
              {...register("message")}
              placeholder="Tell the owner about your trip..."
              rows={2}
              className="flex-1 text-sm text-zinc-900 dark:text-white dark:bg-transparent placeholder:text-zinc-400 focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Price breakdown */}
        {duration > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-2 pt-3 border-t border-zinc-100 dark:border-zinc-800"
          >
            <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
              <span>₹{price.toLocaleString("en-IN")} × {duration} {unit}{duration > 1 ? "s" : ""}</span>
              <span>₹{subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-sm text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1">
                Service fee (10%)
                <Info className="w-3 h-3 text-zinc-400" />
              </span>
              <span>₹{platformFee.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between font-bold text-zinc-900 dark:text-white pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <span>Total</span>
              <span>₹{total.toLocaleString("en-IN")}</span>
            </div>
          </motion.div>
        )}

        {/* Cancellation policy */}
        <div className="flex items-start gap-2 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
          <Info className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 capitalize">{cancellationPolicy} cancellation</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{POLICY_LABELS[cancellationPolicy]}</p>
          </div>
        </div>

        <Button type="submit" isLoading={isSubmitting} className="w-full" size="lg">
          {user ? (instantBooking ? "Book Now" : "Request Booking") : "Login to Book"}
        </Button>
      </form>
    </motion.div>
  );
}
