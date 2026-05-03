"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Plus, Trash2, Users } from "lucide-react";
import { cn } from "@/utils/cn";
import { useTranslations } from "next-intl";

interface Split {
  name: string;
  email: string;
  percentage: number;
  amount: number;
}

interface RentSplitManagerProps {
  bookingId: string;
  totalRent: number;
  onSave: (splits: Split[]) => void;
}

export default function RentSplitManager({
  bookingId,
  totalRent,
  onSave,
}: RentSplitManagerProps) {
  const t = useTranslations("rentSplit");
  const [splits, setSplits] = useState<Split[]>([
    { name: "", email: "", percentage: 100, amount: totalRent },
  ]);
  const [month, setMonth] = useState("");
  const [dueDate, setDueDate] = useState("");

  const addSplit = () => {
    const newPercentage = 100 / (splits.length + 1);
    const updatedSplits = splits.map((s) => ({
      ...s,
      percentage: newPercentage,
      amount: (totalRent * newPercentage) / 100,
    }));
    setSplits([
      ...updatedSplits,
      {
        name: "",
        email: "",
        percentage: newPercentage,
        amount: (totalRent * newPercentage) / 100,
      },
    ]);
  };

  const removeSplit = (index: number) => {
    if (splits.length === 1) return;
    const newSplits = splits.filter((_, i) => i !== index);
    const newPercentage = 100 / newSplits.length;
    setSplits(
      newSplits.map((s) => ({
        ...s,
        percentage: newPercentage,
        amount: (totalRent * newPercentage) / 100,
      }))
    );
  };

  const updateSplit = (index: number, field: keyof Split, value: string | number) => {
    const newSplits = [...splits];
    newSplits[index] = { ...newSplits[index], [field]: value };
    if (field === "percentage") {
      newSplits[index].amount = (totalRent * Number(value)) / 100;
    }
    setSplits(newSplits);
  };

  const totalPercentage = splits.reduce((sum, s) => sum + s.percentage, 0);
  const isValid = Math.abs(totalPercentage - 100) < 0.01 && splits.every((s) => s.name && s.email);

  const handleSave = async () => {
    if (!isValid) return;
    try {
      const res = await fetch("/api/rent-split", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, splits, month, dueDate }),
      });
      if (res.ok) onSave(splits);
    } catch (error) {
      console.error("Failed to save rent split:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-lg border border-zinc-200 dark:border-zinc-800"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-3 text-white">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-xl text-zinc-900 dark:text-white">
            {t("title")}
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {t("total")}: ₹{totalRent.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Date Inputs */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            {t("month")}
          </label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            {t("dueDate")}
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
          />
        </div>
      </div>

      {/* Splits */}
      <div className="space-y-4 mb-6">
        <AnimatePresence mode="popLayout">
          {splits.map((split, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-900 dark:text-white">
                  {t("roommate")} {index + 1}
                </span>
                {splits.length > 1 && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeSplit(index)}
                    className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder={t("namePlaceholder")}
                  value={split.name}
                  onChange={(e) => updateSplit(index, "name", e.target.value)}
                  className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm"
                />
                <input
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  value={split.email}
                  onChange={(e) => updateSplit(index, "email", e.target.value)}
                  className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={split.percentage}
                    onChange={(e) => updateSplit(index, "percentage", parseFloat(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm"
                  />
                  <p className="text-xs text-zinc-500 mt-1">{t("percentage")}</p>
                </div>
                <div className="flex-1">
                  <div className="px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-white font-semibold text-sm">
                    ₹{split.amount.toLocaleString()}
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">{t("amount")}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={addSplit}
        className="w-full py-3 rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2 mb-6"
      >
        <Plus className="w-5 h-5" />
        {t("addRoommate")}
      </motion.button>

      {/* Summary */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-zinc-700 dark:text-zinc-300">
            {t("totalPercentage")}
          </span>
          <span
            className={cn(
              "font-bold",
              Math.abs(totalPercentage - 100) < 0.01
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            )}
          >
            {totalPercentage.toFixed(1)}%
          </span>
        </div>
        {Math.abs(totalPercentage - 100) >= 0.01 && (
          <p className="text-xs text-red-600 dark:text-red-400">
            {t("percentageError")}
          </p>
        )}
      </div>

      {/* Save Button */}
      <motion.button
        whileHover={{ scale: isValid ? 1.02 : 1 }}
        whileTap={{ scale: isValid ? 0.98 : 1 }}
        onClick={handleSave}
        disabled={!isValid}
        className={cn(
          "w-full py-3 rounded-xl font-semibold text-white transition-all",
          isValid
            ? "bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-lg"
            : "bg-zinc-300 dark:bg-zinc-700 cursor-not-allowed"
        )}
      >
        {t("save")}
      </motion.button>
    </motion.div>
  );
}
