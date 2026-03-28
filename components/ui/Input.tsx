"use client";
import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-zinc-700">{label}</label>}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">{icon}</span>}
        <input
          ref={ref}
          suppressHydrationWarning
          className={cn(
            "w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400",
            "focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200",
            "disabled:bg-zinc-50 disabled:cursor-not-allowed",
            icon && "pl-10",
            error && "border-red-400 focus:ring-red-400",
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
);
Input.displayName = "Input";
export default Input;
