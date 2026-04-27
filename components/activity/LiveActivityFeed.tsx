"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Eye, Heart, MessageCircle, Share2, Calendar } from "lucide-react";

interface Activity {
  _id: string;
  activityType: "view" | "wishlist" | "booking" | "inquiry" | "share";
  propertyId: { title: string; location: { city: string } };
  userId?: { username: string };
  metadata?: { userCollege?: string };
  createdAt: string;
}

export default function LiveActivityFeed({ propertyId }: { propertyId?: string }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<{ _id: string; count: number }[]>([]);

  useEffect(() => {
    fetchActivities();
    const interval = setInterval(fetchActivities, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, [propertyId]);

  const fetchActivities = async () => {
    try {
      const url = propertyId
        ? `/api/activity/live?propertyId=${propertyId}&limit=5`
        : "/api/activity/live?limit=10";
      const res = await fetch(url);
      const data = await res.json();
      setActivities(data.activities || []);
      setStats(data.stats || []);
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "view":
        return <Eye className="w-4 h-4" />;
      case "wishlist":
        return <Heart className="w-4 h-4 fill-current" />;
      case "booking":
        return <Calendar className="w-4 h-4" />;
      case "inquiry":
        return <MessageCircle className="w-4 h-4" />;
      case "share":
        return <Share2 className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "view":
        return "bg-blue-500";
      case "wishlist":
        return "bg-red-500";
      case "booking":
        return "bg-green-500";
      case "inquiry":
        return "bg-purple-500";
      case "share":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const getActivityText = (activity: Activity) => {
    const username = activity.userId?.username || "Someone";
    const college = activity.metadata?.userCollege;
    const location = activity.propertyId?.location?.city;

    switch (activity.activityType) {
      case "view":
        return college
          ? `${username} from ${college} viewed a property in ${location}`
          : `${username} viewed a property in ${location}`;
      case "wishlist":
        return `${username} added a property to wishlist`;
      case "booking":
        return `${username} just booked a property! 🎉`;
      case "inquiry":
        return `${username} sent an inquiry`;
      case "share":
        return `${username} shared a property`;
      default:
        return "";
    }
  };

  const totalActivity = stats.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-zinc-900 dark:text-white">
          🔥 Live Activity
        </h3>
        <motion.div
          className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          {totalActivity} active now
        </motion.div>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {["view", "wishlist", "booking", "inquiry", "share"].map((type) => {
          const stat = stats.find((s) => s._id === type);
          const count = stat?.count || 0;
          return (
            <motion.div
              key={type}
              className={`${getActivityColor(type)} rounded-lg p-2 text-white text-center`}
              whileHover={{ scale: 1.05 }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <div className="flex justify-center mb-1">{getActivityIcon(type)}</div>
              <p className="text-xs font-bold">{count}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Activity Feed */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {activities.map((activity, index) => (
            <motion.div
              key={activity._id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: "auto" }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg"
            >
              <motion.div
                className={`${getActivityColor(
                  activity.activityType
                )} rounded-full p-2 text-white flex-shrink-0`}
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                }}
              >
                {getActivityIcon(activity.activityType)}
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                  {getActivityText(activity)}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                  {new Date(activity.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {activities.length === 0 && (
          <p className="text-center text-zinc-500 dark:text-zinc-500 py-8">
            No recent activity
          </p>
        )}
      </div>
    </div>
  );
}
