"use client";
import { motion, AnimatePresence } from "framer-motion";
import { GitCompare, X } from "lucide-react";
import { useCompareStore } from "@/store/compareStore";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function CompareBar() {
  const t = useTranslations("compareBar");
  const { ids, remove, clear } = useCompareStore();
  const router = useRouter();

  return (
    <AnimatePresence>
      {ids.length > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-3"
        >
          <GitCompare className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("selected", { count: ids.length })}
          </span>
          <button
            onClick={() => router.push("/compare")}
            disabled={ids.length < 2}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("compareNow")}
          </button>
          <button onClick={clear} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-3.5 h-3.5 text-gray-500" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
