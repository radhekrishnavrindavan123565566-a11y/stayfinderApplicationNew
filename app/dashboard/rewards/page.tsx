"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Trophy, Gift, Users, Share2, CheckCircle, Zap } from "lucide-react";
import RewardsCard from "@/components/rewards/RewardsCard";
import BadgeShowcase from "@/components/rewards/BadgeShowcase";
import { cn } from "@/utils/cn";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  points: number;
  completed: boolean;
  action: string;
}

export default function RewardsPage() {
  const [rewards, setRewards] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rewardsRes, leaderboardRes] = await Promise.all([
        fetch("/api/rewards"),
        fetch("/api/rewards/leaderboard?period=month&limit=10"),
      ]);

      if (!rewardsRes.ok) {
        console.error("Failed to fetch rewards:", rewardsRes.status);
        setLoading(false);
        return;
      }

      const rewardsData = await rewardsRes.json();
      const leaderboardData = leaderboardRes.ok ? await leaderboardRes.json() : { leaderboard: [] };

      setRewards(rewardsData.reward || null);
      setLeaderboard(leaderboardData.leaderboard || []);
    } catch (error) {
      console.error("Failed to fetch rewards:", error);
    } finally {
      setLoading(false);
    }
  };

  const claimAchievement = async (achievementType: string) => {
    try {
      const res = await fetch("/api/rewards/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ achievementType }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.pointsEarned) {
          alert(`🎉 ${data.message}\n+${data.pointsEarned} points!`);
          fetchData();
        } else {
          alert(data.message || "Achievement already claimed");
        }
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to claim achievement");
      }
    } catch (error) {
      console.error("Failed to claim achievement:", error);
      alert("Failed to claim achievement. Please try again.");
    }
  };

  const achievements: Achievement[] = [
    {
      id: "profile_complete",
      title: "Profile Master",
      description: "Complete your profile 100%",
      icon: <CheckCircle className="w-6 h-6" />,
      points: 100,
      completed: rewards?.achievements?.profileCompleted || false,
      action: "profile_complete",
    },
    {
      id: "first_booking",
      title: "First Home",
      description: "Make your first booking",
      icon: <Gift className="w-6 h-6" />,
      points: 200,
      completed: rewards?.achievements?.firstBooking || false,
      action: "first_booking",
    },
    {
      id: "identity_verified",
      title: "Verified User",
      description: "Verify your identity",
      icon: <CheckCircle className="w-6 h-6" />,
      points: 150,
      completed: rewards?.achievements?.identityVerified || false,
      action: "identity_verified",
    },
    {
      id: "first_review",
      title: "Reviewer",
      description: "Write your first review",
      icon: <Zap className="w-6 h-6" />,
      points: 50,
      completed: rewards?.achievements?.firstReview || false,
      action: "first_review",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-48 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
            <div className="h-96 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
              🏆 Rewards & Achievements
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Earn points, unlock badges, and climb the leaderboard
            </p>
          </div>
        </motion.div>

        {/* Rewards Card */}
        <RewardsCard />

        {/* Achievements Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">
            Available Achievements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className={cn(
                  "bg-white dark:bg-zinc-900 rounded-xl p-6 border-2 transition-all",
                  achievement.completed
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                    : "border-zinc-200 dark:border-zinc-800 hover:border-purple-500"
                )}
              >
                <div
                  className={cn(
                    "rounded-full p-3 mb-4 inline-flex",
                    achievement.completed
                      ? "bg-green-500 text-white"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                  )}
                >
                  {achievement.icon}
                </div>
                <h3 className="font-bold text-zinc-900 dark:text-white mb-1">
                  {achievement.title}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                  {achievement.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                    +{achievement.points} pts
                  </span>
                  {achievement.completed ? (
                    <span className="text-xs bg-green-500 text-white px-3 py-1 rounded-full">
                      ✓ Completed
                    </span>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => claimAchievement(achievement.action)}
                      className="text-xs bg-purple-500 text-white px-3 py-1 rounded-full hover:bg-purple-600"
                    >
                      Claim
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Badges */}
        {rewards?.badges && rewards.badges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">
              Your Badges ({rewards.badges.length})
            </h2>
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
              <BadgeShowcase badges={rewards.badges} />
            </div>
          </motion.div>
        )}

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Monthly Leaderboard
          </h2>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
            <div className="space-y-3">
              {leaderboard.slice(0, 10).map((user, index) => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl transition-all",
                    index < 3
                      ? "bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20"
                      : "bg-zinc-50 dark:bg-zinc-800"
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg",
                      index === 0 && "bg-yellow-500 text-white",
                      index === 1 && "bg-gray-400 text-white",
                      index === 2 && "bg-orange-600 text-white",
                      index > 2 && "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                    )}
                  >
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-zinc-900 dark:text-white">
                      {user.userId?.username || "Anonymous"}
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Level {user.level}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-purple-600 dark:text-purple-400">
                      {user.points.toLocaleString()}
                    </p>
                    <p className="text-xs text-zinc-500">points</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Referral Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-2xl p-8 text-white relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <Share2 className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Refer & Earn</h2>
            </div>
            <p className="mb-6 text-white/90">
              Share your referral code and earn 500 points for each friend who signs up!
            </p>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-4">
              <p className="text-sm text-white/80 mb-2">Your Referral Code</p>
              <p className="text-3xl font-bold tracking-wider">{rewards?.referralCode}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                navigator.clipboard.writeText(rewards?.referralCode);
                alert("Referral code copied!");
              }}
              className="bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-shadow"
            >
              Copy Code
            </motion.button>
          </div>

          {/* Animated background */}
          <div className="absolute inset-0 opacity-20">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-4 h-4 bg-white rounded-full"
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
        </motion.div>
      </div>
    </div>
  );
}
