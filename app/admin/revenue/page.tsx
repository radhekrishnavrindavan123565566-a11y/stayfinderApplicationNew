"use client";

import { useEffect, useState } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import Link from "next/link";
import { ArrowLeft, TrendingUp, AlertCircle, MapPin, DollarSign, Clock, Calendar } from "lucide-react";
import { motion } from "framer-motion";

interface RevenueData {
  period: string;
  revenue: {
    total: number;
    transactions: number;
    grossVolume: number;
    landlordPayouts: number;
    averageCommission: string;
  };
  escrow: {
    totalHeld: number;
    platformFeeHeld: number;
    pendingBookings: number;
  };
  pendingRent: {
    total: number;
    count: number;
    lateFees: number;
    overdueCount: number;
  };
  propertyPerformance: Array<{
    _id: string;
    city: string;
    totalRevenue: number;
    platformFees: number;
    bookings: number;
    propertyCount: number;
    avgRevenuePerProperty: number;
  }>;
  monthlyRevenue: Array<{
    _id: { year: number; month: number };
    revenue: number;
    transactions: number;
  }>;
}

export default function RevenuePage() {
  const { ready, user } = useRequireAuth(["admin"]);
  const [data, setData] = useState<RevenueData | null>(null);
  const [period, setPeriod] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready || !user) return;
    fetchRevenue();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, ready, user]);

  const fetchRevenue = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/revenue?period=${period}`);
    const json = await res.json();
    if (json.success) setData(json.data);
    setLoading(false);
  };

  if (!ready || !user) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-rose-500 border-t-transparent" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-rose-500 border-t-transparent" />
      </div>
    );
  }
  
  if (!data) return <div className="p-8 text-zinc-500 dark:text-zinc-400">No data available</div>;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-rose-500 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Admin
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Revenue Dashboard</h1>
              <p className="text-zinc-500 dark:text-zinc-400">Platform earnings and financial metrics</p>
            </div>
            <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 rounded-xl p-1 border border-zinc-200 dark:border-zinc-800">
              {["all", "month", "week", "today"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                    period === p 
                      ? "bg-rose-500 text-white shadow-md" 
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        >
          <StatCard
            icon={<DollarSign className="w-5 h-5" />}
            title="Platform Revenue"
            value={`₹${data.revenue.total.toLocaleString("en-IN")}`}
            subtitle={`${data.revenue.transactions} transactions`}
            color="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            title="Gross Volume"
            value={`₹${data.revenue.grossVolume.toLocaleString("en-IN")}`}
            subtitle={`Avg: ${data.revenue.averageCommission}`}
            color="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400"
          />
          <StatCard
            icon={<DollarSign className="w-5 h-5" />}
            title="Landlord Payouts"
            value={`₹${data.revenue.landlordPayouts.toLocaleString("en-IN")}`}
            subtitle="Paid to owners"
            color="bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400"
          />
          <StatCard
            icon={<Clock className="w-5 h-5" />}
            title="Funds in Escrow"
            value={`₹${data.escrow.totalHeld.toLocaleString("en-IN")}`}
            subtitle={`${data.escrow.pendingBookings} pending`}
            color="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400"
            highlight
          />
        </motion.div>

        {/* Pending Rent Section */}
        {data.pendingRent && data.pendingRent.count > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 rounded-2xl p-6 border-2 border-red-200 dark:border-red-800 mb-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Pending Rent</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Overdue payments requiring attention</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-red-200 dark:border-red-800">
                <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Total Pending</div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  ₹{data.pendingRent.total.toLocaleString("en-IN")}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                  {data.pendingRent.count} payments
                </div>
              </div>
              
              <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
                <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Late Fees</div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  ₹{Math.round(data.pendingRent.lateFees).toLocaleString("en-IN")}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                  Accumulated penalties
                </div>
              </div>
              
              <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Overdue Count</div>
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {data.pendingRent.overdueCount}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                  Payments past due date
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Property Performance by Location */}
        {data.propertyPerformance && data.propertyPerformance.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 p-6 mb-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-rose-500" />
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                Property Performance by Location
              </h2>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
              Top performing cities by revenue
            </p>
            
            <div className="space-y-3">
              {data.propertyPerformance.map((location, idx) => (
                <div
                  key={location._id}
                  className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/30 flex items-center justify-center font-bold text-rose-600 dark:text-rose-400">
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-zinc-900 dark:text-white">{location.city}</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        {location.propertyCount} properties • {location.bookings} bookings
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600 dark:text-green-400">
                      ₹{location.totalRevenue.toLocaleString("en-IN")}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      Avg: ₹{Math.round(location.avgRevenuePerProperty).toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Monthly Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-rose-500" />
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              Monthly Revenue Trend
            </h2>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
            Last 12 months performance
          </p>
          
          <div className="space-y-3">
            {data.monthlyRevenue.map((month, idx) => {
              const maxRevenue = Math.max(...data.monthlyRevenue.map(m => m.revenue));
              const percentage = (month.revenue / maxRevenue) * 100;
              
              return (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-zinc-900 dark:text-white text-sm">
                      {new Date(month._id.year, month._id.month - 1).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                      })}
                    </span>
                    <div className="text-right">
                      <div className="font-bold text-green-600 dark:text-green-400">
                        ₹{month.revenue.toLocaleString("en-IN")}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        {month.transactions} transactions
                      </div>
                    </div>
                  </div>
                  <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5, delay: idx * 0.05 }}
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
  subtitle,
  color,
  highlight = false,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  color: string;
  highlight?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 12px 30px rgba(0,0,0,0.08)" }}
      className={`p-5 rounded-2xl border transition-all ${
        highlight ? "ring-2 ring-amber-400 dark:ring-amber-600" : ""
      } bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        {icon}
      </div>
      <h3 className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">{title}</h3>
      <div className="text-2xl font-bold mb-1 text-zinc-900 dark:text-white">{value}</div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</p>
    </motion.div>
  );
}
