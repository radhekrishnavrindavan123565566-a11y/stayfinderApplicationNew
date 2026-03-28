"use client";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/utils/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const variants = {
  primary: "bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/25",
  secondary: "bg-zinc-800 hover:bg-zinc-700 text-white",
  outline: "border-2 border-rose-500 text-rose-500 hover:bg-rose-50",
  ghost: "hover:bg-zinc-100 text-zinc-700",
  danger: "bg-red-500 hover:bg-red-600 text-white",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => (
    <motion.button
      ref={ref}
      suppressHydrationWarning
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.97 }}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || isLoading}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </motion.button>
  )
);
Button.displayName = "Button";
export default Button;
