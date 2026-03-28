"use client";
import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { useApi } from "@/hooks/useApi";
import {
  Home, Calendar, Heart, Star, PlusCircle, ArrowRight,
  TrendingUp, BarChart2, MessageCircle, GitCompare,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

const statusVariant: Record<string, "success" | "warning" | "danger" | "info" | "default"> = {
  approved: "success", pending: "warning", rejected: "danger", cancelled: "danger", completed: "info",
};

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { authHeaders } = useApi();
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [bookings, setBookings] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { fetchMe } = useAuthStore();

  useEffect(() => {
    if (!user) { router.push("/auth/login"); return; }
    const load = async () => {
      try {
        await fetchMe();
        const { data: meData } = await axios.get("/api/auth/me", authHeaders());
        const freshUser = meData.data.user;
        const [bRes] = await Promise.all([
          axios.get(`/api/bookings?role=${freshUser.role === "owner" ? "owner" : "tenant"}`, authHeaders()),
        ]);
        setBookings(bRes.data.data.bookings.slice(0, 5));
        if (freshUser.role === "owner") {
          const pRes = await axios.get("/api/properties/my", authHeaders());
          setProperties(pRes.data.data.properties);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!user) return null;

  const stats = [
    { icon: <Calendar className="w-5 h-5" />, label: "Total Bookings", value: bookings.length, color: "bg-blue-50 text-blue-500", border: "border-blue-100" },
    { icon: <Home className="w-5 h-5" />, label: user.role === "owner" ? "My Properties" : "Wishlist", value: user.role === "owner" ? properties.length : user.wishlist?.length || 0, color: "bg-rose-50 text-rose-500", border: "border-rose-100" },
    { icon: <Star className="w-5 h-5" />, label: "Approved", value: bookings.filter((b) => b.status === "approved").length, color: "bg-green-50 text-green-500", border: "border-green-100" },
    { icon: <TrendingUp className="w-5 h-5" />, label: "Pending", value: bookings.filter((b) => b.status === "pending").length, color: "bg-amber-50 text-amber-500", border: "border-amber-100" },
  ];

  const quickActions = [
    ...(user.role === "owner" ? [
      { href: "/dashboard/properties/new", icon: <PlusCircle className="w-6 h-6 mb-3" />, title: "Add New Property", sub: "List your property today", gradient: true, color: "bg-rose-500 text-white shadow-lg shadow-rose-500/25" },
      { href: "/dashboard/properties", icon: <Home className="w-6 h-6 mb-3 text-rose-500" />, title: "My Properties", sub: "Manage your listings", gradient: false, color: "bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm" },
    ] : []),
    { href: "/dashboard/bookings", icon: <Calendar className="w-6 h-6 mb-3 text-blue-500" />, title: "Manage Bookings", sub: "View all your bookings", gradient: false, color: "bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm" },
    { href: "/wishlist", icon: <Heart className="w-6 h-6 mb-3 text-rose-400" />, title: "Wishlist", sub: "Your saved properties", gradient: false, color: "bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm" },
    { href: "/chat", icon: <MessageCircle className="w-6 h-6 mb-3 text-blue-500" />, title: "Messages", sub: "Chat with owners & tenants", gradient: false, color: "bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm" },
    { href: "/compare", icon: <GitCompare className="w-6 h-6 mb-3 text-purple-500" />, title: "Compare", sub: "Compare properties side-by-side", gradient: false, color: "bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm" },
    ...(user.role === "owner" ? [
      { href: "/dashboard/analytics", icon: <BarChart2 className="w-6 h-6 mb-3" />, title: "Analytics", sub: "Earnings & occupancy stats", gradient: true, color: "bg-gradient-to-br from-purple-500 to-blue-600 text-white shadow-lg shadow-purple-500/25" },
    ] : []),
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 pt-6"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
            Welcome back, <span className="text-rose-500">{user.username}</span> 👋
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 capitalize">{user.role} Dashboard</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8"
        >
          {stats.map((s) => (
            <motion.div
              key={s.label}
              variants={fadeUp}
              whileHover={{ y: -3, boxShadow: "0 12px 30px rgba(0,0,0,0.08)" }}
              className={`bg-white dark:bg-zinc-900 rounded-2xl p-4 sm:p-5 shadow-sm border ${s.border} dark:border-zinc-800 transition-shadow`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>{s.icon}</div>
              <div className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
                {loading ? (
                  <div className="h-7 w-8 skeleton-shimmer rounded" />
                ) : s.value}
              </div>
              <div className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-8"
        >
          {quickActions.map((action) => (
            <motion.div key={action.href} variants={fadeUp}>
              <Link href={action.href}>
                <motion.div
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className={`rounded-2xl p-4 sm:p-5 cursor-pointer transition-all ${action.color}`}
                >
                  {action.icon}
                  <p className={`font-semibold text-sm sm:text-base ${action.gradient ? "" : "text-zinc-900 dark:text-white"}`}>
                    {action.title}
                  </p>
                  <p className={`text-xs sm:text-sm mt-1 ${action.gradient ? "opacity-80" : "text-zinc-500 dark:text-zinc-400"}`}>
                    {action.sub}
                  </p>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Recent Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
            <h2 className="font-semibold text-zinc-900 dark:text-white">Recent Bookings</h2>
            <Link href="/dashboard/bookings">
              <Button variant="ghost" size="sm">View All <ArrowRight className="w-4 h-4" /></Button>
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full mx-auto"
              />
            </div>
          ) : bookings.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 text-center text-zinc-400 dark:text-zinc-500"
            >
              No bookings yet
            </motion.div>
          ) : (
            <div className="divide-y divide-zinc-50 dark:divide-zinc-800">
              {bookings.map((b, i) => (
                <motion.div
                  key={b._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-zinc-900 dark:text-white text-sm truncate">
                      {b.propertyId?.title || "Property"}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {format(new Date(b.startDate), "MMM d")} – {format(new Date(b.endDate), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-zinc-900 dark:text-white text-sm">${b.totalPrice}</p>
                    <Badge variant={statusVariant[b.status] || "default"} className="mt-1 capitalize text-xs">
                      {b.status}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
