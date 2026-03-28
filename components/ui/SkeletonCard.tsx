"use client";
import { motion } from "framer-motion";

export default function SkeletonCard() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-zinc-100"
    >
      <div className="h-52 bg-zinc-200 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-zinc-200 rounded animate-pulse w-3/4" />
        <div className="h-3 bg-zinc-200 rounded animate-pulse w-1/2" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-5 bg-zinc-200 rounded animate-pulse w-1/4" />
          <div className="h-4 bg-zinc-200 rounded animate-pulse w-1/5" />
        </div>
      </div>
    </motion.div>
  );
}

export function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}
