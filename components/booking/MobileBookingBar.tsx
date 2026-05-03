"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap } from "lucide-react";
import BookingForm from "./BookingForm";
import { useTranslations } from "next-intl";

interface Props {
  propertyId: string;
  price: number;
  maxGuests: number;
  instantBooking?: boolean;
  cancellationPolicy?: "flexible" | "moderate" | "strict";
}

export default function MobileBookingBar({ propertyId, price, maxGuests, instantBooking, cancellationPolicy }: Props) {
  const t = useTranslations("mobileBooking");
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between shadow-2xl">
        <div>
          <span className="text-xl font-bold text-zinc-900 dark:text-white">
            ₹{price.toLocaleString("en-IN")}
          </span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400"> {t("perMonth")}</span>
        </div>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-rose-500/25"
        >
          {instantBooking && <Zap className="w-4 h-4" />}
          {instantBooking ? t("bookNow") : t("requestBooking")}
        </motion.button>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 rounded-t-3xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="font-bold text-zinc-900 dark:text-white text-lg">{t("bookThisProperty")}</h3>
                <button onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <X className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                </button>
              </div>
              <div className="p-5">
                <BookingForm
                  propertyId={propertyId}
                  price={price}
                  maxGuests={maxGuests}
                  instantBooking={instantBooking}
                  cancellationPolicy={cancellationPolicy}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
