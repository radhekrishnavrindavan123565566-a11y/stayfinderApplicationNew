"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertTriangle, Plus, X, Home } from "lucide-react";
import axios from "axios";
import { useApi } from "@/hooks/useApi";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

interface Props {
  bookingId: string;
  onConfirmed?: () => void;
}

export default function MoveInConfirmation({ bookingId, onConfirmed }: Props) {
  const t = useTranslations("moveIn");
  const { authHeaders } = useApi();
  const [issues, setIssues] = useState<string[]>([]);
  const [issueInput, setIssueInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const addIssue = () => {
    if (issueInput.trim()) {
      setIssues((p) => [...p, issueInput.trim()]);
      setIssueInput("");
    }
  };

  const confirm = async (confirmed: boolean) => {
    setSubmitting(true);
    try {
      await axios.post(`/api/bookings/${bookingId}/move-in-confirm`, {
        confirmed,
        issues,
      }, authHeaders());
      toast.success(confirmed ? t("confirmed") : t("issuesReported"));
      setDone(true);
      onConfirmed?.();
    } catch {
      toast.error(t("failed"));
    } finally {
      setSubmitting(false);
    }
  };

  if (done) return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800"
    >
      <CheckCircle className="w-5 h-5 text-green-500" />
      <p className="text-sm font-medium text-green-700 dark:text-green-400">{t("submitted")}</p>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Home className="w-5 h-5 text-rose-500" />
        <h3 className="font-semibold text-zinc-900 dark:text-white">{t("title")}</h3>
      </div>

      <p className="text-sm text-zinc-500 mb-4">{t("description")}</p>

      {/* Issues */}
      <div className="mb-4">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 block">
          {t("reportIssues")}
        </label>
        <div className="flex gap-2 mb-2">
          <input
            value={issueInput}
            onChange={(e) => setIssueInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addIssue()}
            placeholder={t("placeholder")}
            className="flex-1 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-600 text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
          <button
            onClick={addIssue}
            className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <AnimatePresence>
          {issues.map((issue, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-2 mb-1"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              <span className="text-sm text-zinc-600 dark:text-zinc-400 flex-1">{issue}</span>
              <button onClick={() => setIssues((p) => p.filter((_, idx) => idx !== i))} className="text-zinc-400 hover:text-red-500 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex gap-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => confirm(true)}
          disabled={submitting}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors disabled:opacity-50"
        >
          <CheckCircle className="w-4 h-4" />
          {issues.length > 0 ? t("confirmWithIssues") : t("allGood")}
        </motion.button>
        {issues.length > 0 && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => confirm(false)}
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-colors disabled:opacity-50"
          >
            <AlertTriangle className="w-4 h-4" />
            {t("reportOnly")}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
