"use client";
import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export default function AnimatedNumber({
  value,
  duration = 1000,
  decimals = 0,
  suffix = "",
  prefix = "",
  className = ""
}: AnimatedNumberProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!isInView) return;

    // If reduced motion is preferred, set value immediately
    if (prefersReducedMotion) {
      setCount(value);
      return;
    }

    const steps = 60;
    const increment = value / steps;
    const stepDuration = duration / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value, duration, isInView, prefersReducedMotion]);

  const displayValue = decimals > 0
    ? count.toFixed(decimals)
    : Math.floor(count).toLocaleString();

  return (
    <motion.span
      ref={ref}
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={isInView && !prefersReducedMotion ? { opacity: 1, y: 0 } : isInView ? { opacity: 1 } : {}}
      transition={prefersReducedMotion ? {} : { duration: 0.5 }}
      className={className}
    >
      {prefix}{displayValue}{suffix}
    </motion.span>
  );
}
