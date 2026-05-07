"use client";

import { motion } from "framer-motion";
import { Trophy, Star, Gift, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

interface RewardData {
  points: number;
  level: number;
  badges: { id: string; name: string; icon: string; earnedAt: Date }[];
  streaks: { onTimePayment: number; dailyLogin: number };
  totalEarnings: number;
}

export default function RewardsCard() {
  const [rewards, setRewards] = useState<RewardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const res = await fetch("/api/rewards");
      const data = await res.json();
      setRewards(data.reward);
    } catch (error) {
      console.error("Failed to fetch rewards:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white animate-pulse">
        <div className="h-24 bg-white/20 rounded-lg"></div>
      </div>
    );
  }

  if (!rewards) return null;

  const nextLevelPoints = rewards.level * 500;
  const progress = (rewards.points % 500) / 500 * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-2xl p-6 text-white relative overflow-hidden"
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            initial={{
              x: Math.random() * 100 + "%",
              y: Math.random() * 100 + "%",
            }}
            animate={{
              y: ["-10%", "110%"],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <motion.h3
              className="text-2xl font-bold"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              Level {rewards.level}
            </motion.h3>
            <p className="text-white/80 text-sm">Stayerra Champion</p>
          </div>
          <motion.div
            className="bg-white/20 backdrop-blur-sm rounded-full p-3"
            whileHover={{ scale: 1.1, rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <Trophy className="w-6 h-6" />
          </motion.div>
        </div>

        {/* Points Display */}
        <motion.div
          className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">Points</span>
            <span className="font-bold">{rewards.points.toLocaleString()}</span>
          </div>
          <div className="relative h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-white rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <p className="text-xs text-white/70 mt-1">
            {500 - (rewards.points % 500)} points to Level {rewards.level + 1}
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <motion.div
            className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center"
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Star className="w-5 h-5 mx-auto mb-1" />
            <p className="text-xs text-white/70">Badges</p>
            <p className="font-bold">{rewards.badges.length}</p>
          </motion.div>

          <motion.div
            className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center"
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <TrendingUp className="w-5 h-5 mx-auto mb-1" />
            <p className="text-xs text-white/70">Streak</p>
            <p className="font-bold">{rewards.streaks.onTimePayment}🔥</p>
          </motion.div>

          <motion.div
            className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center"
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Gift className="w-5 h-5 mx-auto mb-1" />
            <p className="text-xs text-white/70">Earned</p>
            <p className="font-bold">₹{rewards.totalEarnings}</p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
