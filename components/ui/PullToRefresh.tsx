"use client";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { ReactNode, useState } from "react";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  threshold?: number;
}

export default function PullToRefresh({
  onRefresh,
  children,
  threshold = 80
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const y = useMotionValue(0);

  const opacity = useTransform(y, [0, threshold], [0, 1]);
  const rotate = useTransform(y, [0, threshold], [0, 360]);
  const scale = useTransform(y, [0, threshold], [0.5, 1]);

  const handleDragEnd = async (_: unknown, info: PanInfo) => {
    if (info.offset.y > threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        y.set(0);
      }
    } else {
      y.set(0);
    }
  };

  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: 0, bottom: threshold }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      style={{ y }}
      className="relative"
    >
      {/* Pull indicator */}
      <motion.div
        style={{ opacity }}
        className="absolute top-0 left-0 right-0 flex justify-center py-4 pointer-events-none"
      >
        <motion.div
          style={{ rotate, scale }}
          className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-amber-400 flex items-center justify-center shadow-lg"
        >
          <RefreshCw className="w-4 h-4 text-white" />
        </motion.div>
      </motion.div>

      {/* Refreshing indicator */}
      {isRefreshing && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-0 left-0 right-0 flex justify-center py-4 z-10"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-amber-400 flex items-center justify-center shadow-lg"
          >
            <RefreshCw className="w-4 h-4 text-white" />
          </motion.div>
        </motion.div>
      )}

      {children}
    </motion.div>
  );
}
