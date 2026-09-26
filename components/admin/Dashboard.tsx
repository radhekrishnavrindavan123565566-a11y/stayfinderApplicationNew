"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, TrendingUp, Users, Home, AlertCircle, CheckCircle } from "lucide-react";
import axios from "axios";
import { useApi } from "@/hooks/useApi";
import StatCard from "./StatCard";
import RecentActivityFeed from "./RecentActivityFeed";
import InquiryCounter from "./InquiryCounter";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { authHeaders } = useApi();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await axios.get("/api/admin/stats", authHeaders());
      const data = res.data;
      
      setStats({
        totalProperties: data.properties?.total || 0,
        activeProperties: data.properties?.active || 0,
        pendingProperties: data.properties?.pending || 0,
        inactiveProperties: data.properties?.inactive || 0,
        totalOwners: data.users?.totalOwners || 0,
        totalTenants: data.users?.totalTenants || 0,
        totalInquiries: data.inquiries?.total || 0,
        todayInquiries: data.inquiries?.today || 0,
        weekInquiries: data.inquiries?.thisWeek || 0,
        recentActivity: data.recentActivity || [],
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Properties"
          value={stats?.totalProperties}
          icon={<Home className="w-5 h-5" />}
          subtext={`${stats?.activeProperties} active`}
          color="bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          title="Property Status"
          value={`${stats?.pendingProperties}/${stats?.inactiveProperties}`}
          subtext="Pending / Inactive"
          icon={<AlertCircle className="w-5 h-5" />}
          color="bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400"
        />
        <StatCard
          title="Total Owners"
          value={stats?.totalOwners}
          icon={<Users className="w-5 h-5" />}
          subtext="Active landlords"
          color="bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400"
        />
        <StatCard
          title="Total Tenants"
          value={stats?.totalTenants}
          icon={<Users className="w-5 h-5" />}
          subtext="Registered users"
          color="bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400"
        />
      </div>

      {/* Inquiry Counter */}
      <InquiryCounter
        today={stats?.todayInquiries}
        thisWeek={stats?.weekInquiries}
        total={stats?.totalInquiries}
      />

      {/* Recent Activity Feed */}
      <RecentActivityFeed activities={stats?.recentActivity} />
    </motion.div>
  );
}
