"use client";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface BackButtonProps {
  className?: string;
  title?: string;
}

export default function BackButton({ className = "", title = "Go back" }: BackButtonProps) {
  const router = useRouter();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => router.back()}
      className={`p-2 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors flex-shrink-0 ${className}`}
      title={title}
    >
      <ArrowLeft className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
    </motion.button>
  );
}
