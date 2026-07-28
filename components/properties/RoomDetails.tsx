"use client";

import { motion } from "framer-motion";
import { Maximize2, DoorOpen, Sofa, Wind } from "lucide-react";

interface Room {
  name: string;
  area: number;
  unit: "sqm" | "sqft";
}

interface RoomDetailsProps {
  rooms: Room[];
  totalArea?: number;
}

const ROOM_ICONS: Record<string, React.ReactNode> = {
  "Master Bedroom": "🛏️",
  "Bedroom": "🛏️",
  "Living Room": "🛋️",
  "Kitchen": "🍳",
  "Dining Room": "🍽️",
  "Bathroom": "🚿",
  "Balcony": "🌳",
  "Hall": "🪑",
  "Study": "📚",
  "Gym": "🏋️",
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function RoomDetails({ rooms, totalArea }: RoomDetailsProps) {
  if (!rooms || rooms.length === 0) {
    return null;
  }

  const totalAreaSqm = rooms.reduce((sum, room) => {
    const area =
      room.unit === "sqft" ? Math.round(room.area / 10.764) : room.area;
    return sum + area;
  }, 0);

  const avgRoomSize = Math.round(totalAreaSqm / rooms.length);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div>
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm">
            🚪
          </span>
          Room Details
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Explore each room in {rooms.length} rooms total
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div
          whileHover={{ y: -2 }}
          className="p-3 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-100 dark:border-purple-800"
        >
          <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
            Total Area
          </p>
          <p className="text-lg font-bold text-zinc-900 dark:text-white mt-1">
            {totalArea || totalAreaSqm}
          </p>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">sqm</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-100 dark:border-blue-800"
        >
          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
            Rooms
          </p>
          <p className="text-lg font-bold text-zinc-900 dark:text-white mt-1">
            {rooms.length}
          </p>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">spaces</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="p-3 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-100 dark:border-green-800"
        >
          <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">
            Avg Size
          </p>
          <p className="text-lg font-bold text-zinc-900 dark:text-white mt-1">
            {avgRoomSize}
          </p>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">sqm/room</p>
        </motion.div>
      </div>

      {/* Room list */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        {rooms.map((room, idx) => {
          const roomArea =
            room.unit === "sqft"
              ? Math.round(room.area / 10.764)
              : room.area;
          const percentage = Math.round(
            (roomArea / (totalArea || totalAreaSqm)) * 100
          );
          const icon =
            ROOM_ICONS[room.name] ||
            ROOM_ICONS[
              Object.keys(ROOM_ICONS).find((key) =>
                room.name.toLowerCase().includes(key.toLowerCase())
              ) || "Hall"
            ];

          return (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-white">
                      {room.name}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {roomArea} {room.unit === "sqft" ? "sqm (converted)" : "sqm"}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full">
                  {percentage}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="relative w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Tips */}
      <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-800 rounded-lg space-y-1">
        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
          💡 Tips for room evaluation
        </p>
        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Larger bedrooms (15+ sqm) provide better comfort</li>
          <li>• Kitchens under 10 sqm may feel cramped</li>
          <li>• Living rooms 20+ sqm offer good lounging space</li>
        </ul>
      </div>
    </motion.div>
  );
}
