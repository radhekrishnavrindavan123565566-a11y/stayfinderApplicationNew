"use client";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Home, MessageSquare, User, ArrowRight } from "lucide-react";

interface Activity {
  _id: string;
  action: string;
  description: string;
  timestamp: string | Date;
  actorId?: string;
}

interface RecentActivityFeedProps {
  activities: Activity[];
}

export default function RecentActivityFeed({
  activities = [],
}: RecentActivityFeedProps) {
  const getActivityIcon = (action: string) => {
    switch (action) {
      case "property_posted":
        return <Home className="w-5 h-5" />;
      case "inquiry_created":
        return <MessageSquare className="w-5 h-5" />;
      default:
        return <User className="w-5 h-5" />;
    }
  };

  const getActivityColor = (action: string) => {
    switch (action) {
      case "property_posted":
        return "bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400";
      case "inquiry_created":
        return "bg-purple-100 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400";
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Recent Activity
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
          Latest platform activities in real-time
        </p>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {activities && activities.length > 0 ? (
          activities.map((activity, index) => (
            <motion.div
              key={activity._id || index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getActivityColor(
                    activity.action
                  )}`}
                >
                  {getActivityIcon(activity.action)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                      {activity.description}
                    </p>
                    <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {activity.timestamp
                      ? (() => {
                          try {
                            const date = new Date(activity.timestamp);
                            if (isNaN(date.getTime())) return "Recently";
                            return format(date, "MMM d, yyyy h:mm a");
                          } catch {
                            return "Recently";
                          }
                        })()
                      : "Recently"}
                  </p>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No activities yet
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
