"use client";

import { motion, type Variants } from "framer-motion";

const shimmer: Variants = {
  hidden: { backgroundPosition: "200% center" },
  show: {
    backgroundPosition: "-200% center",
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "linear" as const,
    },
  },
};

export function PropertyCardSkeleton() {
  return (
    <motion.div
      variants={shimmer}
      initial="hidden"
      animate="show"
      className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800"
      style={{
        backgroundImage:
          "linear-gradient(90deg, transparent, rgba(255,255,255,.1), transparent)",
        backgroundSize: "200% 100%",
      }}
    >
      {/* Image */}
      <div className="w-full h-48 bg-gradient-to-r from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800" />

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="h-5 bg-zinc-200 dark:bg-zinc-700 rounded-full w-3/4" />

        {/* Location */}
        <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded-full w-1/2" />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 py-2">
          <div className="h-8 bg-zinc-200 dark:bg-zinc-700 rounded-lg" />
          <div className="h-8 bg-zinc-200 dark:bg-zinc-700 rounded-lg" />
          <div className="h-8 bg-zinc-200 dark:bg-zinc-700 rounded-lg" />
        </div>

        {/* Price */}
        <div className="h-6 bg-zinc-200 dark:bg-zinc-700 rounded-full w-1/3" />
      </div>
    </motion.div>
  );
}

export function PropertyDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <motion.div
        variants={shimmer}
        initial="hidden"
        animate="show"
        className="w-full h-96 bg-zinc-200 dark:bg-zinc-800 rounded-2xl"
        style={{
          backgroundImage:
            "linear-gradient(90deg, transparent, rgba(255,255,255,.1), transparent)",
          backgroundSize: "200% 100%",
        }}
      />

      {/* Content */}
      <div className="grid grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="col-span-2 space-y-6">
          {/* Title */}
          <motion.div
            variants={shimmer}
            initial="hidden"
            animate="show"
            className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded-full w-1/2"
            style={{
              backgroundImage:
                "linear-gradient(90deg, transparent, rgba(255,255,255,.1), transparent)",
              backgroundSize: "200% 100%",
            }}
          />

          {/* Description lines */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              variants={shimmer}
              initial="hidden"
              animate="show"
              className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-full"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,.1), transparent)",
                backgroundSize: "200% 100%",
                width: i === 2 ? "80%" : "100%",
              }}
            />
          ))}
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Card skeleton */}
          <motion.div
            variants={shimmer}
            initial="hidden"
            animate="show"
            className="p-6 bg-zinc-100 dark:bg-zinc-800 rounded-2xl space-y-3"
            style={{
              backgroundImage:
                "linear-gradient(90deg, transparent, rgba(255,255,255,.1), transparent)",
              backgroundSize: "200% 100%",
            }}
          >
            <div className="h-8 bg-zinc-200 dark:bg-zinc-700 rounded-lg" />
            <div className="h-12 bg-zinc-200 dark:bg-zinc-700 rounded-lg" />
            <div className="h-10 bg-zinc-200 dark:bg-zinc-700 rounded-lg" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            variants={shimmer}
            initial="hidden"
            animate="show"
            className="p-6 bg-zinc-100 dark:bg-zinc-800 rounded-2xl space-y-2"
            style={{
              backgroundImage:
                "linear-gradient(90deg, transparent, rgba(255,255,255,.1), transparent)",
              backgroundSize: "200% 100%",
            }}
          >
            <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded-full w-1/2" />
            <div className="h-8 bg-zinc-200 dark:bg-zinc-700 rounded-full w-2/3" />
          </motion.div>
        ))}
      </div>

      {/* Chart placeholder */}
      <motion.div
        variants={shimmer}
        initial="hidden"
        animate="show"
        className="p-6 bg-zinc-100 dark:bg-zinc-800 rounded-2xl h-80"
        style={{
          backgroundImage:
            "linear-gradient(90deg, transparent, rgba(255,255,255,.1), transparent)",
          backgroundSize: "200% 100%",
        }}
      />

      {/* List placeholders */}
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            variants={shimmer}
            initial="hidden"
            animate="show"
            className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg"
            style={{
              backgroundImage:
                "linear-gradient(90deg, transparent, rgba(255,255,255,.1), transparent)",
              backgroundSize: "200% 100%",
            }}
          />
        ))}
      </div>
    </div>
  );
}
