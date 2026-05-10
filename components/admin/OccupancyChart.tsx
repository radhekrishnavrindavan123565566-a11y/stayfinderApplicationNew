"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Home, Users, TrendingUp, TrendingDown } from "lucide-react";

interface OccupancyData {
  totalRooms: number;
  occupiedRooms: number;
  vacantRooms: number;
  occupancyRate: number;
  trend: "up" | "down" | "stable";
  monthlyData: {
    month: string;
    occupied: number;
    vacant: number;
    rate: number;
  }[];
}

export default function OccupancyChart() {
  const [data, setData] = useState<OccupancyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOccupancyData();
  }, []);

  const fetchOccupancyData = async () => {
    try {
      const res = await fetch("/api/admin/occupancy");
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (error) {
      console.error("Failed to fetch occupancy data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-800">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-zinc-200 dark:bg-zinc-700 rounded w-1/3" />
          <div className="h-32 bg-zinc-200 dark:bg-zinc-700 rounded" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const maxOccupancy = Math.max(...data.monthlyData.map((m) => m.occupied + m.vacant));

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Occupancy Trends
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Room availability and occupancy status
          </p>
        </div>
        <div className="flex items-center gap-2">
          {data.trend === "up" && (
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              Increasing
            </div>
          )}
          {data.trend === "down" && (
            <div className="flex items-center gap-1 text-red-600 dark:text-red-400 text-sm font-medium">
              <TrendingDown className="w-4 h-4" />
              Decreasing
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800"
        >
          <div className="flex items-center gap-2 mb-2">
            <Home className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              Total Rooms
            </span>
          </div>
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {data.totalRooms}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-green-50 dark:bg-green-950/20 rounded-xl p-4 border border-green-200 dark:border-green-800"
        >
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
              Occupied
            </span>
          </div>
          <div className="text-2xl font-bold text-green-900 dark:text-green-100">
            {data.occupiedRooms}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800"
        >
          <div className="flex items-center gap-2 mb-2">
            <Home className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              Vacant
            </span>
          </div>
          <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
            {data.vacantRooms}
          </div>
        </motion.div>
      </div>

      {/* Occupancy Rate */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Occupancy Rate
          </span>
          <span className="text-lg font-bold text-zinc-900 dark:text-white">
            {data.occupancyRate}%
          </span>
        </div>
        <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${data.occupancyRate}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full ${
              data.occupancyRate >= 80
                ? "bg-green-500"
                : data.occupancyRate >= 50
                ? "bg-blue-500"
                : "bg-amber-500"
            }`}
          />
        </div>
      </div>

      {/* Monthly Chart */}
      <div>
        <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
          Last 6 Months Trend
        </h4>
        <div className="flex items-end justify-between gap-2 h-32">
          {data.monthlyData.map((month, idx) => {
            const totalHeight = ((month.occupied + month.vacant) / maxOccupancy) * 100;
            const occupiedHeight = (month.occupied / (month.occupied + month.vacant)) * 100;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full relative" style={{ height: "100px" }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${totalHeight}%` }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="absolute bottom-0 w-full bg-zinc-200 dark:bg-zinc-700 rounded-t-lg overflow-hidden"
                  >
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${occupiedHeight}%` }}
                      transition={{ duration: 0.5, delay: idx * 0.1 + 0.2 }}
                      className="absolute bottom-0 w-full bg-green-500 dark:bg-green-600"
                    />
                  </motion.div>
                </div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  {month.month}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-center gap-4 mt-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span className="text-zinc-600 dark:text-zinc-400">Occupied</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-zinc-300 dark:bg-zinc-700" />
            <span className="text-zinc-600 dark:text-zinc-400">Vacant</span>
          </div>
        </div>
      </div>
    </div>
  );
}
