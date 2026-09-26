"use client";
import { motion } from "framer-motion";
import { MessageSquare, TrendingUp, Calendar } from "lucide-react";

interface InquiryCounterProps {
  today: number;
  thisWeek: number;
  total: number;
}

export default function InquiryCounter({
  today,
  thisWeek,
  total,
}: InquiryCounterProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              New Inquiries & Leads
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Track incoming tenant interest
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Today */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white dark:bg-gray-900 rounded-xl p-4 text-center"
        >
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Today</p>
          <div className="flex items-center justify-center gap-1 mb-2">
            <Calendar className="w-4 h-4 text-purple-500" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {today}
            </p>
          </div>
          <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
            New leads
          </p>
        </motion.div>

        {/* This Week */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white dark:bg-gray-900 rounded-xl p-4 text-center"
        >
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
            This Week
          </p>
          <div className="flex items-center justify-center gap-1 mb-2">
            <TrendingUp className="w-4 h-4 text-pink-500" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {thisWeek}
            </p>
          </div>
          <p className="text-xs text-pink-600 dark:text-pink-400 font-medium">
            Total inquiries
          </p>
        </motion.div>

        {/* Total */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white dark:bg-gray-900 rounded-xl p-4 text-center"
        >
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
            All Time
          </p>
          <div className="flex items-center justify-center gap-1 mb-2">
            <MessageSquare className="w-4 h-4 text-purple-500" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {total}
            </p>
          </div>
          <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
            Total leads
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
