"use client";
import { Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/utils/cn";

interface StarRatingProps {
  value: number;
  onChange?: (val: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizes = { sm: "w-3.5 h-3.5", md: "w-5 h-5", lg: "w-6 h-6" };

export default function StarRating({ value, onChange, readonly = false, size = "md" }: StarRatingProps) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={cn("transition-transform", !readonly && "hover:scale-110 cursor-pointer", readonly && "cursor-default")}
        >
          <Star
            className={cn(
              sizes[size],
              "transition-colors",
              (hovered || value) >= star ? "fill-amber-400 text-amber-400" : "text-zinc-300"
            )}
          />
        </button>
      ))}
    </div>
  );
}
