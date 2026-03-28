"use client";
import { AnimatePresence, motion } from "framer-motion";

interface UrgencySignalsProps {
  propertyId: string;
  weeklyBookings?: number;
  unitCount?: number;
}

export default function UrgencySignals({ weeklyBookings, unitCount }: UrgencySignalsProps) {
  const signals: { key: string; label: string }[] = [];

  if (weeklyBookings && weeklyBookings > 0) {
    signals.push({ key: "bookings", label: `🔥 Booked ${weeklyBookings} times this week` });
  }
  if (unitCount !== undefined && unitCount <= 3) {
    signals.push({ key: "units", label: `⚡ Only ${unitCount} units left` });
  }

  if (signals.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <AnimatePresence>
        {signals.map((signal) => (
          <motion.span
            key={signal.key}
            initial={{ opacity: 0, scale: 0.85, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 4 }}
            transition={{ duration: 0.25 }}
            className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200"
          >
            {signal.label}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}
