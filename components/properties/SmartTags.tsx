"use client";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

const TAG_CONFIG: Record<string, { icon: string; color: string }> = {
  "🎓 Student Friendly": { icon: "🎓", color: "bg-blue-100 text-blue-700" },
  "👨‍👩‍👧 Family Friendly": { icon: "👨‍👩‍👧", color: "bg-purple-100 text-purple-700" },
  "💼 Professional Hub": { icon: "💼", color: "bg-indigo-100 text-indigo-700" },
  "💑 Couple Friendly": { icon: "💑", color: "bg-pink-100 text-pink-700" },
  "Top Match": { icon: "⭐", color: "bg-green-100 text-green-700" },
  "Good Match": { icon: "👍", color: "bg-yellow-100 text-yellow-700" },
  "Perfect Amenities": { icon: "✨", color: "bg-teal-100 text-teal-700" },
  "Preferred Location": { icon: "📍", color: "bg-rose-100 text-rose-700" },
};

function getTagConfig(tag: string) {
  if (TAG_CONFIG[tag]) return TAG_CONFIG[tag];
  return { icon: "🏷️", color: "bg-zinc-100 text-zinc-600" };
}

interface SmartTagsProps {
  tags: string[];
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1 },
};

export default function SmartTags({ tags }: SmartTagsProps) {
  if (!tags || tags.length === 0) return null;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-wrap gap-1.5"
    >
      {tags.map((tag) => {
        const { icon, color } = getTagConfig(tag);
        return (
          <motion.span
            key={tag}
            variants={item}
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
              color
            )}
          >
            <span>{icon}</span>
            {tag}
          </motion.span>
        );
      })}
    </motion.div>
  );
}
