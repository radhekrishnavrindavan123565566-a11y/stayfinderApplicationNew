"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X } from "lucide-react";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
  category: string;
}

interface BadgeShowcaseProps {
  badges: Badge[];
}

export default function BadgeShowcase({ badges }: BadgeShowcaseProps) {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const categoryColors: Record<string, string> = {
    tenant: "from-blue-500 to-cyan-500",
    owner: "from-green-500 to-emerald-500",
    social: "from-purple-500 to-pink-500",
    payment: "from-yellow-500 to-orange-500",
    special: "from-red-500 to-rose-500",
  };

  return (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {badges.map((badge, index) => (
          <motion.button
            key={badge.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: index * 0.1,
              type: "spring",
              stiffness: 200,
            }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedBadge(badge)}
            className={`relative aspect-square rounded-2xl bg-gradient-to-br ${
              categoryColors[badge.category] || "from-gray-500 to-gray-600"
            } p-4 flex flex-col items-center justify-center text-white shadow-lg`}
          >
            <motion.div
              className="text-4xl mb-2"
              animate={{
                rotate: [0, -10, 10, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
              }}
            >
              {badge.icon}
            </motion.div>
            <p className="text-xs font-semibold text-center line-clamp-2">
              {badge.name}
            </p>

            {/* Shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 5,
              }}
            />
          </motion.button>
        ))}
      </div>

      {/* Badge Detail Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedBadge(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className={`bg-gradient-to-br ${
                categoryColors[selectedBadge.category]
              } rounded-3xl p-8 max-w-md w-full text-white relative`}
            >
              <button
                onClick={() => setSelectedBadge(null)}
                className="absolute top-4 right-4 bg-white/20 rounded-full p-2 hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <motion.div
                className="text-8xl text-center mb-6"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 1,
                  ease: "easeInOut",
                }}
              >
                {selectedBadge.icon}
              </motion.div>

              <h3 className="text-3xl font-bold text-center mb-2">
                {selectedBadge.name}
              </h3>
              <p className="text-white/90 text-center mb-4">
                {selectedBadge.description}
              </p>
              <p className="text-sm text-white/70 text-center">
                Earned on {new Date(selectedBadge.earnedAt).toLocaleDateString()}
              </p>

              {/* Confetti effect */}
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white rounded-full"
                  initial={{
                    x: "50%",
                    y: "50%",
                    scale: 0,
                  }}
                  animate={{
                    x: `${Math.random() * 200 - 100}%`,
                    y: `${Math.random() * 200 - 100}%`,
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.02,
                    ease: "easeOut",
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
