"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertOctagon, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";
import axios from "axios";
import { useApi } from "@/hooks/useApi";
import toast from "react-hot-toast";

interface Props {
  bookingId: string;
  onSubmitted?: () => void;
}

const REASONS = [
  { value: "property_mismatch", label: "Property doesn't match listing" },
  { value: "no_access", label: "Unable to access property" },
  { value: "safety_issue", label: "Safety concern" },
  { value: "fraud", label: "Suspected fraud" },
  { value: "other", label: "Other" },
];

export default function DisputeForm({ bookingId, onSubmitted }: Props) {
  const { authHeaders } = useApi();
  const [expanded, setExpanded] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submit = async () => {
    if (!reason || !description.trim()) { toast.error("Fill in all fields"); return; }
    setSubmitting(true);
    try {
      await axios.post("/api/disputes", { bookingId, reason, description }, authHeaders());
      toast.success("Dispute submitted. Our team will review it.");
      setSubmitted(true);
      onSubmitted?.();
    } catch (err) {
      if (axios.isAxiosError(err)) toast.error(err.response?.data?.error || "Failed to submit dispute");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800"
    >
      <CheckCircle className="w-5 h-5 text-blue-500" />
      <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Dispute submitted. We&apos;ll review within 24 hours.</p>
    </motion.div>
  );

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <AlertOctagon className="w-5 h-5 text-red-500" />
          <span className="font-semibold text-zinc-900 dark:text-white">Raise a Dispute</span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4">
              <p className="text-sm text-zinc-500">
                If there&apos;s a problem with your booking, raise a dispute and our team will investigate within 24 hours.
              </p>

              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 block">Reason</label>
                <div className="space-y-2">
                  {REASONS.map((r) => (
                    <label
                      key={r.value}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer text-sm transition-colors ${
                        reason === r.value
                          ? "border-red-400 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                          : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={r.value}
                        checked={reason === r.value}
                        onChange={() => setReason(r.value)}
                        className="sr-only"
                      />
                      {r.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 block">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue in detail..."
                  rows={4}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-600 text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                />
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={submit}
                disabled={submitting || !reason || !description.trim()}
                className="w-full py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Dispute"}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
