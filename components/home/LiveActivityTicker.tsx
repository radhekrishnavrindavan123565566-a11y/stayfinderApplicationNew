"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Eye, CheckCircle } from "lucide-react";

const ACTIVITIES = [
  { icon: "🏠", text: "Rahul just booked a PG in Lucknow",        color: "text-rose-400"    },
  { icon: "👀", text: "Priya is viewing a flat in Prayagraj",      color: "text-blue-400"    },
  { icon: "✅", text: "Anjali's listing got verified in Kanpur",   color: "text-green-400"   },
  { icon: "🔑", text: "Vikram moved in to a room in Varanasi",     color: "text-amber-400"   },
  { icon: "🏠", text: "Sneha just booked a 1BHK in Lucknow",       color: "text-rose-400"    },
  { icon: "👀", text: "Amit is viewing PGs near IIT Kanpur",       color: "text-blue-400"    },
  { icon: "✅", text: "New listing verified in Allahabad",         color: "text-green-400"   },
  { icon: "🔑", text: "Deepak moved in to a studio in Noida",      color: "text-amber-400"   },
];

export default function LiveActivityTicker() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % ACTIVITIES.length), 3500);
    return () => clearInterval(t);
  }, []);

  const activity = ACTIVITIES[idx];

  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
      <AnimatePresence mode="wait">
        <motion.p
          key={idx}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35 }}
          className="text-xs sm:text-sm text-white/70 font-medium"
        >
          <span className="mr-1">{activity.icon}</span>
          <span className={activity.color}>{activity.text}</span>
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
