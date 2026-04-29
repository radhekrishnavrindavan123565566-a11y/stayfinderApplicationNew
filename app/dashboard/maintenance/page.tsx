"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wrench, Clock, CheckCircle, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useApi } from "@/hooks/useApi";
import { format } from "date-fns";
import toast from "react-hot-toast";
import Image from "next/image";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  open:        { label: "Open",        color: "bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400",     icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400", icon: <Clock className="w-3.5 h-3.5" /> },
  resolved:    { label: "Resolved",    color: "bg-green-100 text-green-600 dark:bg-green-950/30 dark:text-green-400", icon: <CheckCircle className="w-3.5 h-3.5" /> },
  closed:      { label: "Closed",      color: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",    icon: <CheckCircle className="w-3.5 h-3.5" /> },
};

const PRIORITY_COLOR: Record<string, string> = {
  low: "bg-zinc-100 text-zinc-500", medium: "bg-blue-100 text-blue-600",
  high: "bg-amber-100 text-amber-700", urgent: "bg-red-100 text-red-600",
};

export default function MaintenancePage() {
  const { ready, user } = useRequireAuth();
  const { authHeaders } = useApi();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!ready || !user) return;
    fetchRequests();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, user]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const role = user?.role === "owner" ? "owner" : "tenant";
      const { data } = await axios.get(`/api/maintenance?role=${role}`, authHeaders());
      setRequests(data.data.requests);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string, ownerNote?: string) => {
    try {
      await axios.patch(`/api/maintenance/${id}`, { status, ownerNote }, authHeaders());
      toast.success("Updated");
      fetchRequests();
    } catch {
      toast.error("Failed to update");
    }
  };

  if (!ready || !user) return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-20 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-rose-500 border-t-transparent" />
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
            <Wrench className="w-7 h-7 text-amber-500" /> Maintenance Requests
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">
            {user?.role === "owner" ? "Manage tenant maintenance requests" : "Track your maintenance requests"}
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
          </div>
        ) : requests.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
            <Wrench className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-500 dark:text-zinc-400">No maintenance requests yet</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => {
              const statusCfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.open;
              const isExpanded = expandedId === req._id;
              return (
                <motion.div key={req._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden shadow-sm">
                  <button onClick={() => setExpandedId(isExpanded ? null : req._id)}
                    className="w-full flex items-start gap-4 p-5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    {req.propertyId?.images?.[0] && (
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                        <Image src={req.propertyId.images[0]} alt={req.propertyId.title} fill className="object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <p className="font-semibold text-zinc-900 dark:text-white text-sm">{req.title}</p>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${PRIORITY_COLOR[req.priority]}`}>
                            {req.priority}
                          </span>
                          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusCfg.color}`}>
                            {statusCfg.icon} {statusCfg.label}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 capitalize">{req.category} • {format(new Date(req.createdAt), "MMM d, yyyy")}</p>
                      {req.propertyId?.title && <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 truncate">{req.propertyId.title}</p>}
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-400 flex-shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-zinc-400 flex-shrink-0 mt-1" />}
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="px-5 pb-5 space-y-4 border-t border-zinc-100 dark:border-zinc-800 pt-4">
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">{req.description}</p>

                          {req.ownerNote && (
                            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900">
                              <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">Owner Note</p>
                              <p className="text-sm text-blue-600 dark:text-blue-300">{req.ownerNote}</p>
                            </div>
                          )}

                          {/* Owner actions */}
                          {user?.role === "owner" && req.status !== "closed" && (
                            <div className="space-y-3">
                              <div>
                                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1 block">Add a note for tenant</label>
                                <textarea
                                  value={noteInputs[req._id] ?? req.ownerNote ?? ""}
                                  onChange={e => setNoteInputs(n => ({ ...n, [req._id]: e.target.value }))}
                                  rows={2} placeholder="e.g. Plumber scheduled for tomorrow..."
                                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-600 text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                                />
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {req.status === "open" && (
                                  <button onClick={() => updateStatus(req._id, "in_progress", noteInputs[req._id])}
                                    className="px-4 py-2 rounded-xl bg-blue-500 text-white text-xs font-semibold hover:bg-blue-600 transition-colors">
                                    Mark In Progress
                                  </button>
                                )}
                                {req.status !== "resolved" && (
                                  <button onClick={() => updateStatus(req._id, "resolved", noteInputs[req._id])}
                                    className="px-4 py-2 rounded-xl bg-green-500 text-white text-xs font-semibold hover:bg-green-600 transition-colors">
                                    Mark Resolved
                                  </button>
                                )}
                                <button onClick={() => updateStatus(req._id, "closed", noteInputs[req._id])}
                                  className="px-4 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors">
                                  Close
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
