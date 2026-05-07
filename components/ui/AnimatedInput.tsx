"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/utils/cn";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface AnimatedInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  success?: boolean;
}

const AnimatedInput = forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({ label, error, success, className, value, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const hasValue = value !== undefined && value !== "";
    const prefersReducedMotion = useReducedMotion();

    return (
      <div className="relative w-full">
        <motion.div
          animate={error && !prefersReducedMotion ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
          className="relative"
        >
          <input
            ref={ref}
            value={value}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={cn(
              "peer w-full px-4 pt-6 pb-2 rounded-xl border-2 transition-all duration-200",
              "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white",
              "focus:outline-none focus:ring-2 focus:ring-offset-2",
              error
                ? "border-red-500 focus:ring-red-500"
                : success
                ? "border-green-500 focus:ring-green-500"
                : "border-zinc-200 dark:border-zinc-700 focus:border-rose-500 focus:ring-rose-500",
              className
            )}
            {...props}
          />
          
          {/* Floating label */}
          <motion.label
            animate={{
              y: focused || hasValue ? -8 : 8,
              scale: focused || hasValue ? 0.85 : 1,
              color: focused
                ? error
                  ? "#ef4444"
                  : success
                  ? "#22c55e"
                  : "#f43f5e"
                : "#71717a"
            }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            className="absolute left-4 top-2 pointer-events-none origin-left font-medium"
          >
            {label}
          </motion.label>

          {/* Status icons */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={prefersReducedMotion ? { opacity: 0 } : { scale: 0, rotate: -180 }}
                animate={prefersReducedMotion ? { opacity: 1 } : { scale: 1, rotate: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { scale: 0, rotate: 180 }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <AlertCircle className="w-5 h-5 text-red-500" />
              </motion.div>
            )}
            {success && !error && (
              <motion.div
                initial={prefersReducedMotion ? { opacity: 0 } : { scale: 0, rotate: -180 }}
                animate={prefersReducedMotion ? { opacity: 1 } : { scale: 1, rotate: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { scale: 0, rotate: 180 }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <CheckCircle className="w-5 h-5 text-green-500" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="text-xs text-red-500 mt-1 ml-1 flex items-center gap-1"
            >
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.3 }}
              >
                ⚠️
              </motion.span>
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

AnimatedInput.displayName = "AnimatedInput";
export default AnimatedInput;
