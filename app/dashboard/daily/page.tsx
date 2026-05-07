"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Receipt,
  Wrench,
  MessageSquare,
  TrendingUp,
  ArrowRight,
  Upload,
  Users,
  Calendar,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import axios from "axios";

interface DashboardStats {
  documents: number;
  expenses: number;
  settlements: { owedToMe: number; iOwe: number };
  maintenanceRequests: number;
}

export default function DailyEngagementDashboard() {
  const { user, accessToken } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    documents: 0,
    expenses: 0,
    settlements: { owedToMe: 0, iOwe: 0 },
    maintenanceRequests: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;

    const fetchStats = async () => {
      try {
        const headers = { Authorization: `Bearer ${accessToken}` };

        const [docsRes, expensesRes, settlementsRes] = await Promise.all([
          axios.get("/api/documents", { headers }),
          axios.get("/api/expenses?limit=1", { headers }),
          axios.get("/api/expenses/settlements?status=pending", { headers }),
        ]);

        setStats({
          documents: docsRes.data.data?.length || 0,
          expenses: expensesRes.data.pagination?.total || 0,
          settlements: settlementsRes.data.summary || { owedToMe: 0, iOwe: 0 },
          maintenanceRequests: 0,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [accessToken]);

  const features = [
    {
      title: "Document Vault",
      description: "Store and share rental documents securely",
      icon: <FileText className="w-6 h-6" />,
      href: "/dashboard/documents",
      color: "from-blue-500 to-cyan-400",
      stat: `${stats.documents} documents`,
    },
    {
      title: "Bill Splitter",
      description: "Split expenses with roommates easily",
      icon: <Receipt className="w-6 h-6" />,
      href: "/dashboard/expenses",
      color: "from-green-500 to-emerald-400",
      stat: `${stats.expenses} expenses`,
    },
    {
      title: "Rent Reminders",
      description: "Never miss a rent payment deadline",
      icon: <Calendar className="w-6 h-6" />,
      href: "/dashboard/rent",
      color: "from-purple-500 to-violet-400",
      stat: "Auto-reminders",
    },
    {
      title: "Maintenance",
      description: "Track property maintenance requests",
      icon: <Wrench className="w-6 h-6" />,
      href: "/dashboard/maintenance",
      color: "from-orange-500 to-amber-400",
      stat: `${stats.maintenanceRequests} requests`,
    },
    {
      title: "Community",
      description: "Read locality reviews and Q&A",
      icon: <MessageSquare className="w-6 h-6" />,
      href: "/community",
      color: "from-rose-500 to-pink-400",
      stat: "Explore areas",
    },
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-zinc-500">Please log in to access this page</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white mb-2">
            Daily Essentials
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Manage your rental life in one place
          </p>
        </motion.div>

        {/* Quick Stats */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
          >
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
                    Owed to Me
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{stats.settlements.owedToMe.toFixed(0)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
                    I Owe
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    ₹{stats.settlements.iOwe.toFixed(0)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-orange-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
                    Documents
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.documents}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 1) }}
            >
              <Link href={feature.href}>
                <div className="group relative bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 hover:shadow-xl transition-all cursor-pointer overflow-hidden">
                  {/* Gradient overlay */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                  />

                  {/* Icon */}
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}
                  >
                    {feature.icon}
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                    {feature.description}
                  </p>

                  {/* Stat */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      {feature.stat}
                    </span>
                    <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-3xl p-8 text-white"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Get Started</h2>
              <p className="text-emerald-50">
                Upload your first document or create an expense
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/dashboard/documents">
                <button className="flex items-center gap-2 bg-white text-emerald-600 px-6 py-3 rounded-xl font-semibold hover:bg-emerald-50 transition-colors">
                  <Upload className="w-5 h-5" />
                  Upload Document
                </button>
              </Link>
              <Link href="/dashboard/expenses">
                <button className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-colors border border-white/30">
                  <Users className="w-5 h-5" />
                  Split Bill
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
