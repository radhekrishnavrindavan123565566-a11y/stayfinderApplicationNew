"use client";
import { motion } from "framer-motion";
import { Calendar, MapPin, Check, X, Clock } from "lucide-react";
import { format } from "date-fns";
import axios from "axios";
import { useApi } from "@/hooks/useApi";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

interface VisitCardProps {
  action: {
    _id: string;
    status: string;
    payload?: { date?: string; time?: string; address?: string; propertyTitle?: string };
    initiatorId: { _id: string; username: string };
    expiresAt: string;
  };
  isMine: boolean;
  onRespond?: () => void;
}

export default function VisitCard({ action, isMine, onRespond }: VisitCardProps) {
  const t = useTranslations("visitCard");
  const { authHeaders } = useApi();

  const respond = async (response: "accepted" | "rejected") => {
    try {
      await axios.post(`/api/chat/actions/${action._id}/respond`, { response }, authHeaders());
      toast.success(response === "accepted" ? t("visitScheduled") : t("visitDeclined"));
      onRespond?.();
    } catch {
      toast.error(t("respondFailed"));
    }
  };

  const statusColor = {
    pending: "border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800",
    accepted: "border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800",
    rejected: "border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800",
    expired: "border-zinc-200 bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700",
  }[action.status] || "border-zinc-200 bg-zinc-50";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-2xl border p-4 max-w-xs ${statusColor}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
          <Calendar className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-white">{t("visitRequest")}</p>
          <p className="text-xs text-zinc-500">{action.initiatorId.username}</p>
        </div>
      </div>

      {action.payload?.propertyTitle && (
        <p className="text-xs text-zinc-500 mb-2 truncate">{action.payload.propertyTitle}</p>
      )}

      {action.payload?.date && (
        <div className="flex items-center gap-1.5 text-sm font-semibold text-zinc-900 dark:text-white mb-1">
          <Calendar className="w-4 h-4 text-blue-500" />
          {format(new Date(action.payload.date), "EEE, MMM d yyyy")}
          {action.payload.time && ` at ${action.payload.time}`}
        </div>
      )}

      {action.payload?.address && (
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-3">
          <MapPin className="w-3 h-3" />
          {action.payload.address}
        </div>
      )}

      <div className="flex items-center gap-1 text-xs text-zinc-400 mb-3">
        <Clock className="w-3 h-3" />
        {t("expires", { date: format(new Date(action.expiresAt), "MMM d, HH:mm") })}
      </div>

      {action.status === "pending" && !isMine && (
        <div className="flex gap-2">
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => respond("accepted")}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-500 text-white text-xs font-semibold hover:bg-blue-600 transition-colors">
            <Check className="w-3.5 h-3.5" /> {t("confirm")}
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => respond("rejected")}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors">
            <X className="w-3.5 h-3.5" /> {t("decline")}
          </motion.button>
        </div>
      )}

      {action.status !== "pending" && (
        <div className={`text-center text-xs font-semibold py-1.5 rounded-xl ${
          action.status === "accepted" ? "text-green-600" :
          action.status === "rejected" ? "text-red-500" : "text-zinc-400"
        }`}>
          {action.status.charAt(0).toUpperCase() + action.status.slice(1)}
        </div>
      )}
    </motion.div>
  );
}
