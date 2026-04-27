"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertCircle, Clock, PenLine, Home, ChevronDown, ChevronUp } from "lucide-react";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { useApi } from "@/hooks/useApi";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";

type ItemStatus = "ok" | "damaged" | "missing" | "pending";

interface ChecklistItem {
  id: string;
  label: string;
  category: string;
  tenantStatus: ItemStatus;
  ownerStatus: ItemStatus;
  tenantNote?: string;
  ownerNote?: string;
  photos: string[];
}

interface Checklist {
  _id: string;
  bookingId: string;
  status: "draft" | "tenant_signed" | "owner_signed" | "completed" | "disputed";
  items: ChecklistItem[];
  tenantSignedAt?: string;
  ownerSignedAt?: string;
  depositAmount?: number;
  tenantId: { _id: string; username: string; avatar?: string };
  ownerId: { _id: string; username: string; avatar?: string };
  propertyId: { title: string };
}

const STATUS_CONFIG: Record<ItemStatus, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  ok: { label: "OK", icon: <CheckCircle className="w-4 h-4" />, color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-950/30 border-green-200 dark:border-green-800" },
  damaged: { label: "Damaged", icon: <AlertCircle className="w-4 h-4" />, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800" },
  missing: { label: "Missing", icon: <XCircle className="w-4 h-4" />, color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-950/30 border-red-200 dark:border-red-800" },
  pending: { label: "Pending", icon: <Clock className="w-4 h-4" />, color: "text-zinc-500 dark:text-zinc-400", bg: "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700" },
};

const CHECKLIST_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400" },
  tenant_signed: { label: "Tenant Signed", color: "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400" },
  owner_signed: { label: "Owner Signed", color: "bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400" },
  completed: { label: "✅ Completed", color: "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400" },
  disputed: { label: "⚠ Disputed", color: "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400" },
};

function CategoryGroup({ category, items, isTenant, isOwner, onChange }: {
  category: string;
  items: ChecklistItem[];
  isTenant: boolean;
  isOwner: boolean;
  onChange: (id: string, status: ItemStatus, note: string) => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
      <button onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
        <div className="flex items-center gap-2">
          <Home className="w-4 h-4 text-rose-400" />
          <span className="font-semibold text-sm text-zinc-900 dark:text-white">{category}</span>
          <span className="text-xs text-zinc-400">({items.length})</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="divide-y divide-zinc-50 dark:divide-zinc-800">
              {items.map((item) => {
                const myStatus = isTenant ? item.tenantStatus : item.ownerStatus;
                const myNote = isTenant ? item.tenantNote : item.ownerNote;
                const otherStatus = isTenant ? item.ownerStatus : item.tenantStatus;
                const cfg = STATUS_CONFIG[myStatus];
                const otherCfg = STATUS_CONFIG[otherStatus];
                return (
                  <div key={item.id} className="px-4 py-3 space-y-2">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <p className="text-sm text-zinc-800 dark:text-zinc-200 flex-1">{item.label}</p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Other party status */}
                        <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${otherCfg.bg} ${otherCfg.color}`}>
                          {otherCfg.icon} {isTenant ? "Owner" : "Tenant"}: {otherCfg.label}
                        </span>
                      </div>
                    </div>
                    {/* My status buttons */}
                    {(isTenant || isOwner) && (
                      <div className="flex flex-wrap gap-1.5">
                        {(["ok", "damaged", "missing"] as ItemStatus[]).map((s) => {
                          const c = STATUS_CONFIG[s];
                          return (
                            <button key={s} type="button"
                              onClick={() => onChange(item.id, s, myNote || "")}
                              className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-xl border transition-all ${
                                myStatus === s ? `${c.bg} ${c.color} font-semibold` : "bg-white dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
                              }`}>
                              {c.icon} {c.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {/* Note */}
                    {(isTenant || isOwner) && myStatus !== "ok" && myStatus !== "pending" && (
                      <input
                        value={myNote || ""}
                        onChange={(e) => onChange(item.id, myStatus, e.target.value)}
                        placeholder="Add a note (optional)..."
                        className="w-full px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs bg-white dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ChecklistPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full" />
      </div>
    }>
      <ChecklistPageContent />
    </Suspense>
  );
}

function ChecklistPageContent() {
  const { user } = useAuthStore();
  const { authHeaders } = useApi();
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [localItems, setLocalItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [signing, setSigning] = useState(false);

  const load = useCallback(async () => {
    if (!bookingId) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/checklist?bookingId=${bookingId}`, authHeaders());
      setChecklist(data.data.checklist);
      setLocalItems(data.data.checklist.items);
    } catch { toast.error("Failed to load checklist"); }
    finally { setLoading(false); }
  }, [bookingId, authHeaders]);

  useEffect(() => {
    if (!user) { router.push("/auth/login"); return; }
    if (!bookingId) { router.push("/dashboard/bookings"); return; }
    load();
  }, [user, bookingId, load, router]);

  const isTenant = checklist?.tenantId._id === user?._id;
  const isOwner = checklist?.ownerId._id === user?._id;

  const handleItemChange = (id: string, status: ItemStatus, note: string) => {
    setLocalItems((prev) => prev.map((item) => {
      if (item.id !== id) return item;
      return isTenant
        ? { ...item, tenantStatus: status, tenantNote: note }
        : { ...item, ownerStatus: status, ownerNote: note };
    }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const updates = localItems.map((item) => ({
        id: item.id,
        status: isTenant ? item.tenantStatus : item.ownerStatus,
        note: isTenant ? item.tenantNote : item.ownerNote,
      }));
      await axios.patch("/api/checklist", { bookingId, items: updates }, authHeaders());
      toast.success("Saved");
    } catch { toast.error("Save failed"); }
    finally { setSaving(false); }
  };

  const sign = async () => {
    setSigning(true);
    try {
      const updates = localItems.map((item) => ({
        id: item.id,
        status: isTenant ? item.tenantStatus : item.ownerStatus,
        note: isTenant ? item.tenantNote : item.ownerNote,
      }));
      const { data } = await axios.patch("/api/checklist", { bookingId, items: updates, action: "sign" }, authHeaders());
      setChecklist(data.data.checklist);
      setLocalItems(data.data.checklist.items);
      toast.success("Checklist signed!");
    } catch { toast.error("Sign failed"); }
    finally { setSigning(false); }
  };

  const alreadySigned = checklist
    ? (isTenant && checklist.tenantSignedAt) || (isOwner && checklist.ownerSignedAt)
    : false;

  // Group items by category
  const categories = [...new Set(localItems.map((i) => i.category))];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full" />
    </div>
  );

  if (!checklist) return null;

  const statusCfg = CHECKLIST_STATUS_LABELS[checklist.status];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-20 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 space-y-5">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <PenLine className="w-6 h-6 text-rose-500" /> Move-in Checklist
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">{checklist.propertyId.title}</p>
            </div>
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${statusCfg.color}`}>{statusCfg.label}</span>
          </div>

          {/* Parties */}
          <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500">
            <span className={`flex items-center gap-1 ${checklist.tenantSignedAt ? "text-green-600 dark:text-green-400" : ""}`}>
              {checklist.tenantSignedAt ? "✅" : "⏳"} Tenant: {checklist.tenantId.username}
            </span>
            <span className={`flex items-center gap-1 ${checklist.ownerSignedAt ? "text-green-600 dark:text-green-400" : ""}`}>
              {checklist.ownerSignedAt ? "✅" : "⏳"} Owner: {checklist.ownerId.username}
            </span>
          </div>
        </motion.div>

        {/* Instructions */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-2xl px-4 py-3 text-xs text-blue-700 dark:text-blue-400">
          Mark each item as <strong>OK</strong>, <strong>Damaged</strong>, or <strong>Missing</strong>. Both parties must sign to complete the checklist. This protects your deposit.
        </motion.div>

        {/* Checklist items by category */}
        <div className="space-y-3">
          {categories.map((cat) => (
            <motion.div key={cat} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <CategoryGroup
                category={cat}
                items={localItems.filter((i) => i.category === cat)}
                isTenant={!!isTenant}
                isOwner={!!isOwner}
                onChange={handleItemChange}
              />
            </motion.div>
          ))}
        </div>

        {/* Actions */}
        {(isTenant || isOwner) && !alreadySigned && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 pt-2">
            <Button onClick={save} isLoading={saving} variant="outline" className="flex-1">Save Progress</Button>
            <Button onClick={sign} isLoading={signing} className="flex-1">
              ✍ Sign Checklist
            </Button>
          </motion.div>
        )}

        {alreadySigned && checklist.status !== "completed" && (
          <div className="text-center py-4 text-sm text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
            You have signed. Waiting for the {isTenant ? "owner" : "tenant"} to sign.
          </div>
        )}

        {checklist.status === "completed" && (
          <div className="text-center py-6 bg-green-50 dark:bg-green-950/20 rounded-2xl border border-green-200 dark:border-green-800">
            <div className="text-4xl mb-2">✅</div>
            <p className="font-bold text-green-700 dark:text-green-400">Checklist Complete</p>
            <p className="text-xs text-green-600 dark:text-green-500 mt-1">Both parties have signed. This document is now locked.</p>
          </div>
        )}
      </div>
    </div>
  );
}
