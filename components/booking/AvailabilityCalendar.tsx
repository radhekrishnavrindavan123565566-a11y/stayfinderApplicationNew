"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, isBefore, addMonths, subMonths, isWithinInterval } from "date-fns";
import axios from "axios";
import { cn } from "@/utils/cn";

interface Props {
  propertyId: string;
  onRangeSelect?: (start: Date, end: Date) => void;
  isOwner?: boolean;
}

interface BookedRange { startDate: string; endDate: string; status: string }
type DemandLevel = "low" | "medium" | "high";

export default function AvailabilityCalendar({ propertyId, onRangeSelect, isOwner }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);
  const [bookedRanges, setBookedRanges] = useState<BookedRange[]>([]);
  const [demandHeatmap, setDemandHeatmap] = useState<Record<string, DemandLevel>>({});
  const [selectStart, setSelectStart] = useState<Date | null>(null);
  const [selectEnd, setSelectEnd] = useState<Date | null>(null);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axios.get(`/api/properties/${propertyId}/availability`);
        setBlockedDates(data.data.blockedDates.map((d: string) => new Date(d)));
        setBookedRanges(data.data.bookings);
        if (data.data.demandHeatmap) setDemandHeatmap(data.data.demandHeatmap);
      } catch { /* silent */ }
      finally { setIsLoading(false); }
    };
    fetch();
  }, [propertyId]);

  const getDemand = (d: Date): DemandLevel | null => {
    const key = format(d, "yyyy-MM-dd");
    return demandHeatmap[key] ?? null;
  };

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const startPad = startOfMonth(currentMonth).getDay();

  const isBlocked = (d: Date) => blockedDates.some((b) => isSameDay(b, d));
  const isBooked = (d: Date) => bookedRanges.some((r) =>
    isWithinInterval(d, { start: new Date(r.startDate), end: new Date(r.endDate) })
  );
  const isInSelection = (d: Date) => {
    const end = selectEnd || hoveredDate;
    if (!selectStart || !end) return false;
    const [s, e] = selectStart <= end ? [selectStart, end] : [end, selectStart];
    return isWithinInterval(d, { start: s, end: e });
  };

  const handleDayClick = (d: Date) => {
    if (isBlocked(d) || isBooked(d) || isBefore(d, new Date())) return;
    if (!selectStart || (selectStart && selectEnd)) {
      setSelectStart(d); setSelectEnd(null);
    } else {
      const [s, e] = d >= selectStart ? [selectStart, d] : [d, selectStart];
      setSelectEnd(e);
      onRangeSelect?.(s, e);
    }
  };

  const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
        <h3 className="font-semibold text-sm text-gray-900 dark:text-white">{format(currentMonth, "MMMM yyyy")}</h3>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-gray-400 py-1">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      {isLoading ? (
        <div className="grid grid-cols-7 gap-0.5">
          {[...Array(35)].map((_, i) => (
            <div key={i} className="h-8 rounded-lg bg-gray-100 dark:bg-gray-700 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-0.5">
          {[...Array(startPad)].map((_, i) => <div key={`pad-${i}`} />)}
          {days.map((day) => {
            const blocked = isBlocked(day);
            const booked = isBooked(day);
            const past = isBefore(day, new Date()) && !isToday(day);
            const inSel = isInSelection(day);
            const isStart = selectStart && isSameDay(day, selectStart);
            const isEnd = selectEnd && isSameDay(day, selectEnd);
            const disabled = blocked || booked || past;
            const demand = !disabled ? getDemand(day) : null;

            return (
              <motion.button
                key={day.toISOString()}
                whileHover={!disabled ? { scale: 1.1 } : {}}
                whileTap={!disabled ? { scale: 0.95 } : {}}
                onClick={() => handleDayClick(day)}
                onMouseEnter={() => selectStart && !selectEnd && setHoveredDate(day)}
                onMouseLeave={() => setHoveredDate(null)}
                disabled={disabled}
                className={cn(
                  "h-8 w-full rounded-lg text-xs font-medium transition-colors relative",
                  past && "text-gray-300 dark:text-gray-600 cursor-not-allowed",
                  blocked && "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed",
                  booked && "bg-red-50 dark:bg-red-900/20 text-red-400 cursor-not-allowed line-through",
                  !disabled && !inSel && demand === "high" && "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300",
                  !disabled && !inSel && demand === "medium" && "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
                  !disabled && !inSel && !demand && "hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-700 dark:text-gray-300",
                  !disabled && !inSel && demand && "hover:opacity-80",
                  inSel && !isStart && !isEnd && "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-none",
                  (isStart || isEnd) && "bg-blue-600 text-white",
                  isToday(day) && !inSel && "ring-1 ring-blue-400"
                )}
              >
                {format(day, "d")}
                {blocked && <Lock className="w-2 h-2 absolute bottom-0.5 right-0.5 text-gray-400" />}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 mt-3 text-[10px] text-gray-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-100 inline-block" /> Booked</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-100 inline-block" /> Blocked</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-600 inline-block" /> Selected</span>
        {Object.keys(demandHeatmap).length > 0 && (
          <>
            <span className="flex items-center gap-1">🔴 High demand</span>
            <span className="flex items-center gap-1">🟡 Medium demand</span>
          </>
        )}
      </div>
    </div>
  );
}
