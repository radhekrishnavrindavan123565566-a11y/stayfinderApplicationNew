"use client";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { ButtonHTMLAttributes, forwardRef, useState } from "react";
import { cn } from "@/utils/cn";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface EnhancedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  ripple?: boolean;
}

interface Ripple {
  x: number;
  y: number;
  id: number;
}

const variants = {
  primary: "bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white shadow-lg shadow-rose-500/25",
  secondary: "bg-zinc-800 hover:bg-zinc-700 text-white",
  outline: "border-2 border-rose-500 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20",
  ghost: "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300",
  danger: "bg-red-500 hover:bg-red-600 text-white",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

const EnhancedButton = forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, ripple = true, children, disabled, onClick, ...props }, ref) => {
    const [ripples, setRipples] = useState<Ripple[]>([]);
    const prefersReducedMotion = useReducedMotion();

    const createRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!ripple || disabled || isLoading || prefersReducedMotion) return;
      
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const newRipple = { x, y, id: Date.now() };
      setRipples(prev => [...prev, newRipple]);
      
      // Call original onClick
      onClick?.(e);
    };

    const removeRipple = (id: number) => {
      setRipples(prev => prev.filter(r => r.id !== id));
    };

    return (
      <motion.button
        ref={ref}
        suppressHydrationWarning
        whileHover={prefersReducedMotion ? {} : { scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={prefersReducedMotion ? {} : { scale: disabled || isLoading ? 1 : 0.97 }}
        className={cn(
          "relative inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden",
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        onClick={createRipple}
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        {/* Ripple effects */}
        {!prefersReducedMotion && ripples.map(ripple => (
          <motion.span
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            onAnimationComplete={() => removeRipple(ripple.id)}
            className="absolute rounded-full bg-white pointer-events-none"
            style={{
              left: ripple.x - 10,
              top: ripple.y - 10,
              width: 20,
              height: 20,
            }}
          />
        ))}
        
        {/* Content */}
        <span className="relative z-10 flex items-center gap-2">
          {isLoading && (
            <motion.div
              animate={prefersReducedMotion ? {} : { rotate: 360 }}
              transition={prefersReducedMotion ? {} : { duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-4 h-4" />
            </motion.div>
          )}
          {children}
        </span>
      </motion.button>
    );
  }
);

EnhancedButton.displayName = "EnhancedButton";
export default EnhancedButton;
