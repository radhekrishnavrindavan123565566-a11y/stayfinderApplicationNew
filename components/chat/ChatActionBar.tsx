"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Calendar, FileText, ChevronDown, X } from "lucide-react";
import axios from "axios";
import { useApi } from "@/hooks/useApi";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

interface ChatActionBarProps {
  conversationId: string;
  receiverId: string;
  propertyId?: string;
  propertyTitle?: string;
  propertyAddress?: string;
  onActionCreated?: () => void;
}

type ActionType = "send_offer" | "schedule_visit" | "generate_agreement";

export default function ChatActionBar({
  conversationId, receiverId, propertyId, propertyTitle, propertyAddress, onActionCreated,
}: ChatActionBarProps) {
  const t = useTranslations("chatAction");
  const { authHeaders } = useApi();
  const [open, setOpen] = useState(false);
  const [activeForm, setActiveForm] = useState<ActionType | null>(null);
  const [loading, setLoading] = useState(false);

  const [offerAmount, setOfferAmount] = useState("");
  const [offerMessage, setOfferMessage] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [visitTime, setVisitTime] = useState("10:00");

  const actions = [
    { type: "send_offer" as ActionType, icon: <DollarSign className="w-4 h-4" />, label: t("sendOffer"), color: "text-green-600 bg-green-50 hover:bg-green-100" },
    { type: "schedule_visit" as ActionType, icon: <Calendar className="w-4 h-4" />, label: t("scheduleVisit"), color: "text-blue-600 bg-blue-50 hover:bg-blue-100" },
    { type: "generate_agreement" as ActionType, icon: <FileText className="w-4 h-4" />, label: t("requestAgreement"), color: "text-purple-600 bg-purple-50 hover:bg-purple-100" },
  ];

  const submit = async () => {
    if (!activeForm) return;
    setLoading(true);
    try {
      let payload: Record<string, unknown> = { propertyTitle };
      if (activeForm === "send_offer") {
        if (!offerAmount) { toast.error(t("enterAmount")); return; }
        payload = { ...payload, amount: Number(offerAmount), message: offerMessage };
      } else if (activeForm === "schedule_visit") {
        if (!visitDate) { toast.error(t("selectDate")); return; }
        payload = { ...payload, date: visitDate, time: visitTime, address: propertyAddress };
      }
      await axios.post("/api/chat/actions", { conversationId, receiverId, type: activeForm, payload }, authHeaders());
      toast.success(t("actionSent"));
      setActiveForm(null);
      setOpen(false);
      onActionCreated?.();
    } catch {
      toast.error(t("actionFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-xs font-medium hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
      >
        {t("actions")} <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute bottom-full mb-2 left-0 bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-700 p-3 w-64 z-50"
          >
            {!activeForm ? (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide px-1 mb-2">{t("quickActions")}</p>
                {actions.map((a) => (
                  <button key={a.type} onClick={() => setActiveForm(a.type)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${a.color}`}>
                    {a.icon} {a.label}
                  </button>
                ))}
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                    {activeForm === "send_offer" ? t("sendOffer") : activeForm === "schedule_visit" ? t("scheduleVisit") : t("requestAgreement")}
                  </p>
                  <button onClick={() => setActiveForm(null)} className="text-zinc-400 hover:text-zinc-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {activeForm === "send_offer" && (
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs text-zinc-500 mb-1 block">{t("monthlyRent")}</label>
                      <input type="number" value={offerAmount} onChange={(e) => setOfferAmount(e.target.value)}
                        placeholder="e.g. 1500"
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-600 text-sm bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-400" />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 mb-1 block">{t("messageOptional")}</label>
                      <input value={offerMessage} onChange={(e) => setOfferMessage(e.target.value)}
                        placeholder={t("addNote")}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-600 text-sm bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-400" />
                    </div>
                  </div>
                )}

                {activeForm === "schedule_visit" && (
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs text-zinc-500 mb-1 block">{t("date")}</label>
                      <input type="date" value={visitDate} min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setVisitDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-600 text-sm bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400" />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 mb-1 block">{t("time")}</label>
                      <input type="time" value={visitTime} onChange={(e) => setVisitTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-600 text-sm bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400" />
                    </div>
                  </div>
                )}

                {activeForm === "generate_agreement" && (
                  <p className="text-xs text-zinc-500">{t("agreementNote")}</p>
                )}

                <motion.button whileTap={{ scale: 0.97 }} onClick={submit} disabled={loading}
                  className="w-full mt-3 py-2 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 transition-colors disabled:opacity-50">
                  {loading ? t("sending") : t("send")}
                </motion.button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
