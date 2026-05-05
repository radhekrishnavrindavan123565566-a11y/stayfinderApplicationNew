"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { useApi } from "@/hooks/useApi";
import { useRouter } from "next/navigation";
import {
  Users, Home, Calendar, DollarSign, Trash2, Shield, TrendingUp, Zap,
  CheckCircle, XCircle, FileText, ExternalLink, AlertOctagon,
  Bell, Megaphone, Upload, Send,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import toast from "react-hot-toast";
import { format } from "date-fns";

type Tab = "overview" | "users" | "verifications" | "disputes" | "reminders" | "marketing";

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function AdminPage() {
  const { user } = useAuthStore();
  const { authHeaders } = useApi();
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stats, setStats] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [users, setUsers] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pendingVerifications, setPendingVerifications] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("overview");

  useEffect(() => {
    if (!user) { router.push("/auth/login"); return; }
    if (user.role !== "admin") { router.push("/dashboard"); return; }
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadData = async () => {
    try {
      const [statsRes, usersRes, disputesRes] = await Promise.all([
        axios.get("/api/admin/stats", authHeaders()),
        axios.get("/api/admin/users", authHeaders()),
        axios.get("/api/disputes", authHeaders()),
      ]);
      setStats(statsRes.data.data);
      const allUsers = usersRes.data.data.users;
      setUsers(allUsers);
      setPendingVerifications(
        allUsers.filter((u: { role: string; ownerVerified: boolean; verificationDoc?: string }) =>
          u.role === "owner" && !u.ownerVerified && u.verificationDoc
        )
      );
      setDisputes(disputesRes.data.data?.disputes || []);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    try {
      await axios.delete(`/api/admin/users/${id}`, authHeaders());
      setUsers((prev) => prev.filter((u) => u._id !== id));
      toast.success("User deleted");
    } catch { toast.error("Failed to delete user"); }
  };

  const handleVerification = async (userId: string, approve: boolean) => {
    try {
      await axios.patch(`/api/admin/users/${userId}`, { ownerVerified: approve }, authHeaders());
      setPendingVerifications((prev) => prev.filter((u) => u._id !== userId));
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, ownerVerified: approve } : u)));
      toast.success(approve ? "Owner verified successfully" : "Verification rejected");
    } catch { toast.error("Failed to update verification"); }
  };

  const resolveDispute = async (id: string, status: string, resolution: string) => {
    try {
      await axios.patch(`/api/disputes/${id}`, { status, resolution }, authHeaders());
      setDisputes((prev) => prev.map((d) => d._id === id ? { ...d, status, resolution } : d));
      toast.success("Dispute updated");
    } catch { toast.error("Failed to update dispute"); }
  };

  if (!user || user.role !== "admin") return null;

  const statCards = [
    { icon: <Users className="w-5 h-5" />, label: "Total Users", value: stats?.totalUsers, color: "bg-blue-50 text-blue-500 dark:bg-blue-950/30 dark:text-blue-400" },
    { icon: <Shield className="w-5 h-5" />, label: "Owners", value: stats?.ownerCount, color: "bg-indigo-50 text-indigo-500 dark:bg-indigo-950/30 dark:text-indigo-400" },
    { icon: <Users className="w-5 h-5" />, label: "Tenants", value: stats?.tenantCount, color: "bg-cyan-50 text-cyan-500 dark:bg-cyan-950/30 dark:text-cyan-400" },
    { icon: <Home className="w-5 h-5" />, label: "Properties", value: stats?.totalProperties, color: "bg-rose-50 text-rose-500 dark:bg-rose-950/30 dark:text-rose-400" },
    { icon: <Calendar className="w-5 h-5" />, label: "Bookings", value: stats?.totalBookings, color: "bg-green-50 text-green-500 dark:bg-green-950/30 dark:text-green-400" },
    { icon: <DollarSign className="w-5 h-5" />, label: "Total Revenue", value: stats ? `?${stats.revenue?.toLocaleString()}` : "-", color: "bg-amber-50 text-amber-500 dark:bg-amber-950/30 dark:text-amber-400" },
    { icon: <TrendingUp className="w-5 h-5" />, label: "Platform Fees", value: stats ? `?${stats.platformRevenue?.toLocaleString()}` : "-", color: "bg-purple-50 text-purple-500 dark:bg-purple-950/30 dark:text-purple-400" },
    { icon: <Zap className="w-5 h-5" />, label: "Boosted Listings", value: stats?.boostedProperties, color: "bg-orange-50 text-orange-500 dark:bg-orange-950/30 dark:text-orange-400" },
  ];

  const tabs: { key: Tab; label: string; badge?: number }[] = [
    { key: "overview", label: "Overview" },
    { key: "users", label: "Users" },
    { key: "verifications", label: "Verifications", badge: pendingVerifications.length },
    { key: "disputes", label: "Disputes", badge: disputes.filter((d) => d.status === "open").length },
    { key: "reminders", label: "Reminders" },
    { key: "marketing", label: "Bulk Marketing" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
            >
              <Shield className="w-7 h-7 text-rose-500" />
            </motion.div>
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">Admin Panel</h1>
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage your platform</p>
        </motion.div>

        {/* Tab bar — scrollable on mobile */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-1 mb-6 gap-1 overflow-x-auto w-full sm:w-fit"
        >
          {tabs.map((t) => (
            <motion.button
              key={t.key}
              onClick={() => setTab(t.key)}
              whileTap={{ scale: 0.96 }}
              className={`relative px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all capitalize flex items-center gap-1.5 whitespace-nowrap ${
                tab === t.key
                  ? "bg-rose-500 text-white shadow"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              {t.label}
              {t.badge != null && t.badge > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                    tab === t.key ? "bg-white text-rose-500" : "bg-rose-500 text-white"
                  }`}
                >
                  {t.badge}
                </motion.span>
              )}
            </motion.button>
          ))}
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full"
            />
          </div>
        ) : (
          <AnimatePresence mode="wait">

            {/* Overview */}
            {tab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  variants={stagger}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8"
                >
                  {statCards.map((s) => (
                    <motion.div
                      key={s.label}
                      variants={fadeUp}
                      whileHover={{ y: -3, boxShadow: "0 12px 30px rgba(0,0,0,0.08)" }}
                      className="bg-white dark:bg-zinc-900 rounded-2xl p-4 sm:p-5 shadow-sm border border-zinc-100 dark:border-zinc-800 transition-shadow"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>{s.icon}</div>
                      <div className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">{s.value ?? "—"}</div>
                      <div className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{s.label}</div>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden"
                >
                  <div className="px-4 sm:px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                    <h2 className="font-semibold text-zinc-900 dark:text-white">Recent Bookings</h2>
                  </div>
                  <div className="divide-y divide-zinc-50 dark:divide-zinc-800">
                    {stats?.recentBookings?.map((b: { _id: string; propertyId?: { title?: string }; tenantId?: { username?: string }; totalPrice: number; createdAt: string }, i: number) => (
                      <motion.div
                        key={b._id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35 + i * 0.04 }}
                        className="flex items-center justify-between px-4 sm:px-6 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-zinc-900 dark:text-white text-sm truncate">{b.propertyId?.title || "Property"}</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            by {b.tenantId?.username || "User"} • {format(new Date(b.createdAt), "MMM d, yyyy")}
                          </p>
                        </div>
                        <span className="font-semibold text-zinc-900 dark:text-white ml-4 flex-shrink-0">?{b.totalPrice?.toLocaleString("en-IN")}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Users */}
            {tab === "users" && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden"
              >
                <div className="px-4 sm:px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                  <h2 className="font-semibold text-zinc-900 dark:text-white">All Users ({users.length})</h2>
                </div>
                <motion.div
                  variants={stagger}
                  initial="hidden"
                  animate="show"
                  className="divide-y divide-zinc-50 dark:divide-zinc-800"
                >
                  {users.map((u) => (
                    <motion.div
                      key={u._id}
                      variants={fadeUp}
                      className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-rose-100 dark:bg-rose-950/30 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-rose-500">{u.username[0].toUpperCase()}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-zinc-900 dark:text-white text-sm flex items-center gap-1.5 truncate">
                            {u.username}
                            {u.ownerVerified && <CheckCircle className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{u.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-2">
                        <Badge variant={u.role === "admin" ? "danger" : u.role === "owner" ? "info" : "default"} className="capitalize text-xs">
                          {u.role}
                        </Badge>
                        {u._id !== user._id && (
                          <Button size="sm" variant="ghost" onClick={() => deleteUser(u._id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 p-1.5">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* Verifications */}
            {tab === "verifications" && (
              <motion.div
                key="verifications"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden"
              >
                <div className="px-4 sm:px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                  <h2 className="font-semibold text-zinc-900 dark:text-white">
                    Pending Verifications ({pendingVerifications.length})
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Review owner identity documents</p>
                </div>

                {pendingVerifications.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-16 text-zinc-400 gap-3"
                  >
                    <CheckCircle className="w-12 h-12 opacity-30" />
                    <p className="text-sm">No pending verification requests</p>
                  </motion.div>
                ) : (
                  <motion.div variants={stagger} initial="hidden" animate="show" className="divide-y divide-zinc-50 dark:divide-zinc-800">
                    {pendingVerifications.map((u) => (
                      <motion.div
                        key={u._id}
                        variants={fadeUp}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 sm:px-6 py-4 sm:py-5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-amber-600">{u.username[0].toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="font-medium text-zinc-900 dark:text-white text-sm">{u.username}</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">{u.email}</p>
                            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                              Submitted {format(new Date(u.createdAt), "MMM d, yyyy")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {u.verificationDoc && (
                            <a href={u.verificationDoc} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-700 transition-colors px-2 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/20">
                              <FileText className="w-4 h-4" /> View Doc <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => handleVerification(u._id, false)}
                            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 border border-red-200 dark:border-red-900 gap-1.5 text-xs">
                            <XCircle className="w-4 h-4" /> Reject
                          </Button>
                          <Button size="sm" onClick={() => handleVerification(u._id, true)}
                            className="bg-green-500 hover:bg-green-600 text-white gap-1.5 text-xs">
                            <CheckCircle className="w-4 h-4" /> Approve
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Disputes */}
            {tab === "disputes" && (
              <motion.div
                key="disputes"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden"
              >
                <div className="px-4 sm:px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                  <h2 className="font-semibold text-zinc-900 dark:text-white">Disputes ({disputes.length})</h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Review and resolve tenant disputes</p>
                </div>
                {disputes.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-16 text-zinc-400 gap-3">
                    <AlertOctagon className="w-12 h-12 opacity-30" />
                    <p className="text-sm">No disputes filed</p>
                  </motion.div>
                ) : (
                  <motion.div variants={stagger} initial="hidden" animate="show" className="divide-y divide-zinc-50 dark:divide-zinc-800">
                    {disputes.map((d) => (
                      <motion.div key={d._id} variants={fadeUp} className="px-4 sm:px-6 py-4 sm:py-5">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="min-w-0">
                            <p className="font-medium text-zinc-900 dark:text-white text-sm capitalize">
                              {d.reason?.replace(/_/g, " ")}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">{d.description}</p>
                            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                              by {d.raisedBy?.username || "User"} • {d.createdAt && format(new Date(d.createdAt), "MMM d, yyyy")}
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${
                            d.status === "open" ? "bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400" :
                            d.status === "under_review" ? "bg-amber-100 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400" :
                            d.status === "resolved_refund" ? "bg-green-100 text-green-600 dark:bg-green-950/30 dark:text-green-400" :
                            "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                          }`}>
                            {d.status?.replace(/_/g, " ")}
                          </span>
                        </div>
                        {d.status === "open" && (
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" onClick={() => resolveDispute(d._id, "resolved_refund", "Refund approved")}
                              className="bg-green-500 hover:bg-green-600 text-white text-xs">
                              Approve Refund
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => resolveDispute(d._id, "resolved_no_refund", "No refund")} className="text-xs">
                              No Refund
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => resolveDispute(d._id, "under_review", "Under review")} className="text-xs">
                              Mark Under Review
                            </Button>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Reminders */}
            {tab === "reminders" && (
              <motion.div key="reminders" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
                <RemindersPanel authHeaders={authHeaders} />
              </motion.div>
            )}

            {/* Bulk Marketing */}
            {tab === "marketing" && (
              <motion.div key="marketing" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
                <BulkMarketingPanel authHeaders={authHeaders} />
              </motion.div>
            )}

          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

// -- Reminders Panel -----------------------------------------------------------
function RemindersPanel({ authHeaders }: { authHeaders: () => { headers: { Authorization: string } | { Authorization?: undefined } } }) {
  const [sending, setSending] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, number> | null>(null);

  const send = async (type: string) => {
    setSending(type);
    try {
      const { data } = await axios.post("/api/admin/reminders", { type }, authHeaders());
      setResults(data.data.results);
      toast.success("Reminders sent!");
    } catch { toast.error("Failed to send reminders"); }
    finally { setSending(null); }
  };

  const REMINDER_TYPES = [
    { key: "tenant_rent", icon: "💰", title: "Tenant Rent Reminder", desc: "Bhai, 5 tarikh hai — Rent Pay Karo!", color: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400" },
    { key: "owner_agreement", icon: "📄", title: "Owner Agreement Expiry", desc: "Agreement expire ho raha hai, renew kar lo.", color: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400" },
    { key: "admin_verification", icon: "✅", title: "Admin Verification Alert", desc: "Nayi property verification pending hai.", color: "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400" },
    { key: "all", icon: "🔔", title: "Send All Reminders", desc: "Sabhi reminders ek saath bhejo.", color: "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400" },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-rose-500" />
          <h2 className="font-semibold text-zinc-900 dark:text-white">Smart Reminder System</h2>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-5">Ek click mein sabhi relevant users ko reminder bhejo. Reminders in-app notification ke through jaate hain.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {REMINDER_TYPES.map((r) => (
            <div key={r.key} className={`rounded-2xl border p-4 ${r.color}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-sm flex items-center gap-2">{r.icon} {r.title}</p>
                  <p className="text-xs opacity-75 mt-1">{r.desc}</p>
                  {results && results[r.key] !== undefined && (
                    <p className="text-xs font-bold mt-2">? {results[r.key]} users ko bheja</p>
                  )}
                </div>
                <Button size="sm" onClick={() => send(r.key)} isLoading={sending === r.key}
                  className="flex-shrink-0 bg-white/80 dark:bg-zinc-800 text-zinc-800 dark:text-white border border-current/20 hover:bg-white dark:hover:bg-zinc-700 text-xs">
                  <Send className="w-3.5 h-3.5" /> Send
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// -- Bulk Marketing Panel ------------------------------------------------------
function BulkMarketingPanel({ authHeaders }: { authHeaders: () => { headers: { Authorization: string } | { Authorization?: undefined } } }) {
  const [title, setTitle] = useState("Nestora — Special Offer for Lucknow!");
  const [message, setMessage] = useState("Namaskar! Nestora par aaj hi apna ghar dhundein ya list karein. Lucknow ke sabse verified listings sirf hamare paas. Visit: nestora.in");
  const [role, setRole] = useState("all");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sentToUsers: number; csvContacts: number; matchedFromCsv: number } | null>(null);

  const send = async () => {
    if (!message.trim()) { toast.error("Message likhna zaroori hai"); return; }
    setSending(true);
    try {
      const form = new FormData();
      form.append("title", title);
      form.append("message", message);
      form.append("role", role);
      if (csvFile) form.append("csv", csvFile);
      const { data } = await axios.post("/api/admin/bulk-marketing", form, authHeaders());
      setResult(data.data);
      toast.success(`${data.data.total} users ko message bheja gaya!`);
    } catch { toast.error("Send failed"); }
    finally { setSending(false); }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 space-y-5">
      <div className="flex items-center gap-2">
        <Megaphone className="w-5 h-5 text-rose-500" />
        <h2 className="font-semibold text-zinc-900 dark:text-white">Bulk Marketing Panel</h2>
        <span className="text-xs bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400 px-2 py-0.5 rounded-full">Lucknow Focus</span>
      </div>

      {/* Title */}
      <div>
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">Notification Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm bg-white dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400" />
      </div>

      {/* Message */}
      <div>
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">Message</label>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4}
          className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm bg-white dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none" />
        <p className="text-xs text-zinc-400 mt-1">{message.length} characters</p>
      </div>

      {/* Target */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">Target Users</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm bg-white dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400">
            <option value="all">All Users</option>
            <option value="tenant">Tenants Only</option>
            <option value="owner">Owners Only</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">CSV Upload (optional)</label>
          <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-600 cursor-pointer hover:border-rose-400 transition-colors">
            <Upload className="w-4 h-4 text-zinc-400" />
            <span className="text-xs text-zinc-500 truncate">{csvFile ? csvFile.name : "Name, Phone, Email"}</span>
            <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(e) => setCsvFile(e.target.files?.[0] || null)} />
          </label>
        </div>
      </div>

      {/* CSV format hint */}
      <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-3 text-xs text-zinc-500 dark:text-zinc-400">
        <p className="font-medium mb-1">CSV Format:</p>
        <code className="text-zinc-600 dark:text-zinc-300">Name, Phone, Email</code><br />
        <code className="text-zinc-600 dark:text-zinc-300">Rahul Verma, 9876543210, rahul@email.com</code>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl p-3 text-sm text-green-700 dark:text-green-400">
          ✓ Registered users: <strong>{result.sentToUsers}</strong> • CSV contacts: <strong>{result.csvContacts}</strong> • Matched: <strong>{result.matchedFromCsv}</strong>
        </div>
      )}

      <Button onClick={send} isLoading={sending} className="w-full gap-2" size="lg">
        <Send className="w-4 h-4" /> Send to All
      </Button>
    </div>
  );
}
