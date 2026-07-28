"use client";

import { motion, type Variants } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  type?: "fade" | "slide" | "scale" | "blur";
  duration?: number;
  delay?: number;
  className?: string;
}

const transitionVariants: Record<string, Variants> = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.05 },
  },
  blur: {
    initial: { opacity: 0, filter: "blur(10px)" },
    animate: { opacity: 1, filter: "blur(0px)" },
    exit: { opacity: 0, filter: "blur(10px)" },
  },
};

export function PageTransition({
  children,
  type = "fade",
  duration = 0.5,
  delay = 0,
  className = "",
}: PageTransitionProps) {
  const variants = transitionVariants[type] || transitionVariants.fade;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerContainerProps {
  children: ReactNode;
  staggerDelay?: number;
  delayChildren?: number;
  duration?: number;
  className?: string;
}

const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export function StaggerContainer({
  children,
  staggerDelay = 0.1,
  delayChildren = 0.2,
  duration = 0.5,
  className = "",
}: StaggerContainerProps) {
  const customVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={customVariants}
      className={className}
    >
      {Array.isArray(children)
        ? children.map((child, index) => (
            <motion.div key={index} variants={staggerItemVariants}>
              {child}
            </motion.div>
          ))
        : children}
    </motion.div>
  );
}

interface AnimatedSectionProps {
  children: ReactNode;
  title?: string;
  delay?: number;
  className?: string;
}

export function AnimatedSection({
  children,
  title,
  delay = 0,
  className = "",
}: AnimatedSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {title && (
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay }}
          className="text-2xl font-bold text-zinc-900 dark:text-white mb-6"
        >
          {title}
        </motion.h2>
      )}
      {children}
    </motion.section>
  );
}

interface SkeletonTransitionProps {
  isLoading: boolean;
  children: ReactNode;
  skeleton: ReactNode;
  duration?: number;
}

export function SkeletonTransition({
  isLoading,
  children,
  skeleton,
  duration = 0.3,
}: SkeletonTransitionProps) {
  return (
    <motion.div
      initial={false}
      animate={{
        opacity: isLoading ? 0 : 1,
        pointerEvents: isLoading ? "none" : "auto",
      }}
      transition={{ duration }}
    >
      {isLoading ? skeleton : children}
    </motion.div>
  );
}

