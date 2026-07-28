"use client";

import { motion, type Variants } from "framer-motion";
import { ReactNode } from "react";

interface ResponsiveGridProps {
  children: ReactNode;
  columns?: number;
  gap?: number;
  mobileColumns?: number;
  tabletColumns?: number;
  staggerDelay?: number;
  animated?: boolean;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export function ResponsiveGrid({
  children,
  columns = 3,
  gap = 6,
  mobileColumns = 1,
  tabletColumns = 2,
  staggerDelay = 0.1,
  animated = true,
}: ResponsiveGridProps) {
  const gridColsMap: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6",
  };

  const gapMap: Record<number, string> = {
    2: "gap-2",
    3: "gap-3",
    4: "gap-4",
    6: "gap-6",
    8: "gap-8",
  };

  const containerClass = `
    grid 
    ${gridColsMap[columns] || "grid-cols-3"}
    lg:${gridColsMap[columns] || "grid-cols-3"}
    md:${gridColsMap[tabletColumns] || "grid-cols-2"}
    sm:${gridColsMap[mobileColumns] || "grid-cols-1"}
    ${gapMap[gap] || "gap-6"}
    w-full
  `;

  if (!animated) {
    return <div className={containerClass}>{children}</div>;
  }

  return (
    <motion.div
      className={containerClass}
      initial="hidden"
      animate="show"
      variants={containerVariants}
    >
      {Array.isArray(children)
        ? children.map((child, index) => (
            <motion.div key={index} variants={itemVariants}>
              {child}
            </motion.div>
          ))
        : children}
    </motion.div>
  );
}

interface MasonryGridProps {
  children: ReactNode;
  columns?: number;
  gap?: number;
}

export function MasonryGrid({
  children,
  columns = 3,
  gap = 6,
}: MasonryGridProps) {
  const gapMap: Record<number, string> = {
    2: "gap-2",
    3: "gap-3",
    4: "gap-4",
    6: "gap-6",
    8: "gap-8",
  };

  return (
    <div
      className={`columns-${columns} md:columns-${Math.max(columns - 1, 2)} sm:columns-1 ${
        gapMap[gap] || "gap-6"
      }`}
    >
      {Array.isArray(children)
        ? children.map((child, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="break-inside-avoid mb-6"
            >
              {child}
            </motion.div>
          ))
        : children}
    </div>
  );
}

interface GridItemProps {
  children: ReactNode;
  colSpan?: number;
  rowSpan?: number;
  className?: string;
}

export function GridItem({
  children,
  colSpan = 1,
  rowSpan = 1,
  className = "",
}: GridItemProps) {
  const colSpanMap: Record<number, string> = {
    1: "col-span-1",
    2: "col-span-2",
    3: "col-span-3",
    4: "col-span-4",
  };

  const rowSpanMap: Record<number, string> = {
    1: "row-span-1",
    2: "row-span-2",
    3: "row-span-3",
  };

  return (
    <div
      className={`${colSpanMap[colSpan] || "col-span-1"} ${
        rowSpanMap[rowSpan] || "row-span-1"
      } ${className}`}
    >
      {children}
    </div>
  );
}

