"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wrench, Sparkles, Truck, Sofa, Check, ChevronDown, ChevronUp } from "lucide-react";
import axios from "axios";
import { useApi } from "@/hooks/useApi";
import toast from "react-hot-toast";

interface Service {
  _id: string;
  type: string;
  title: string;
  description: string;
  price: number;
  priceUnit: string;
}

interface Props {
  bookingId: string;
  city?: string;
}

const typeIcon: Record<string, React.ReactNode> = {
  cleaning: <Sparkles className="w-5 h-5" />,
  maintenance: <Wrench className="w-5 h-5" />,
  moving: <Truck className="w-5 h-5" />,
  furniture_rental: <Sofa className="w-5 h-5" />,
};

const typeColor: Record<string, string> = {
  cleaning: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  maintenance: "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  moving: "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  furniture_rental: "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
};

export default function EcosystemServices({ bookingId, city }: Props) {
  const { authHeaders } = useApi();
  const [services, setServices] = useState<Service[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [scheduledDate, setScheduledDate] = useState("");
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState<string[]>([]);

  useEffect(() => {
    const url = city ? `/api/ecosystem/services?city=${city}` : "/api/ecosystem/services";
    axios.get(url, authHeaders()).then(({ data }) => setServices(data.data.services)).catch(() => {});
  }, [city]);

  const book = async (serviceId: string) => {
    if (!scheduledDate) { toast.error("Select a date"); return; }
    setBooking(true);
    try {
      await axios.post("/api/ecosystem/bookings", { bookingId, serviceId, scheduledDate }, authHeaders());
      toast.success("Service booked!");
      setBooked((prev) => [...prev, serviceId]);
      setSelected(null);
    } catch {
      toast.error("Failed to book service");
    } finally {
      setBooking(false);
    }
  };

  if (services.length === 0) return null;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-rose-500" />
          <span className="font-semibold text-zinc-900 dark:text-white">Add-on Services</span>
          <span className="text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">{services.length} available</span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {services.map((s, i) => (
                <motion.div
                  key={s._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`rounded-xl border p-4 cursor-pointer transition-all ${
                    selected === s._id
                      ? "border-rose-400 bg-rose-50 dark:bg-rose-900/20"
                      : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
                  } ${booked.includes(s._id) ? "opacity-60 pointer-events-none" : ""}`}
                  onClick={() => setSelected(selected === s._id ? null : s._id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${typeColor[s.type] || "bg-zinc-100 text-zinc-500"}`}>
                      {typeIcon[s.type] || <Wrench className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-zinc-900 dark:text-white text-sm">{s.title}</p>
                        {booked.includes(s._id) && <Check className="w-4 h-4 text-green-500 flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{s.description}</p>
                      <p className="text-sm font-semibold text-rose-500 mt-1">
                        ${s.price} <span className="text-xs font-normal text-zinc-400">/{s.priceUnit.replace("per_", "")}</span>
                      </p>
                    </div>
                  </div>

                  <AnimatePresence>
                    {selected === s._id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mt-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <label className="text-xs text-zinc-500 mb-1 block">Preferred Date</label>
                        <input
                          type="date"
                          value={scheduledDate}
                          min={new Date().toISOString().split("T")[0]}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-600 text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400 mb-2"
                        />
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          onClick={() => book(s._id)}
                          disabled={booking}
                          className="w-full py-2 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 transition-colors disabled:opacity-50"
                        >
                          {booking ? "Booking..." : "Book Service"}
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
