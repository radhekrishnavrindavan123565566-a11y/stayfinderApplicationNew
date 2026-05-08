"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  DollarSign,
  PieChart,
  BarChart3,
  Calendar,
  Download,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAuthStore } from "@/store/authStore";
import axios from "axios";
import Button from "@/components/ui/Button";
import Link from "next/link";

interface Analytics {
  summary: {
    totalSpending: number;
    expenseCount: number;
    averageExpense: number;
    recurringExpensesCount: number;
    recurringMonthlyTotal: number;
  };
  categoryBreakdown: Array<{
    category: string;
    total: number;
    count: number;
    average: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    total: number;
    count: number;
  }>;
  topExpenses: Array<{
    _id: string;
    description: string;
    category: string;
    amount: number;
    date: string;
  }>;
  recurringExpenses: Array<{
    _id: string;
    description: string;
    category: string;
    frequency: string;
    amount: number;
    nextDate: string;
  }>;
}

const CATEGORY_COLORS: Record<string, string> = {
  electricity: "bg-yellow-500",
  water: "bg-blue-500",
  internet: "bg-purple-500",
  groceries: "bg-green-500",
  rent: "bg-rose-500",
  other: "bg-zinc-500",
};

const CATEGORY_ICONS: Record<string, string> = {
  electricity: "⚡",
  water: "💧",
  internet: "📡",
  groceries: "🛒",
  rent: "🏠",
  other: "📝",
};

export default function ExpenseAnalyticsPage() {
  const { ready, user: authUser } = useRequireAuth();
  const { accessToken } = useAuthStore();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");

  useEffect(() => {
    if (!ready || !authUser || !accessToken) return;

    const fetchAnalytics = async () => {
      try {
        const { data } = await axios.get(`/api/expenses/analytics?period=${period}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setAnalytics(data.data);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [ready, authUser, accessToken, period]);

  const exportToCSV = () => {
    if (!analytics) return;

    const csvData = [
      ["Category", "Total", "Count", "Average"],
      ...analytics.categoryBreakdown.map((cat) => [
        cat.category,
        cat.total.toFixed(2),
        cat.count,
        cat.average.toFixed(2),
      ]),
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expense-analytics-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  if (!ready || !authUser) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-20 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-zinc-900 dark:text-white mb-2">
              Expense Analytics
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Understand your spending patterns
            </p>
          </div>
          <div className="flex gap-3">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
            <Button onClick={exportToCSV}>
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {analytics && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Total Spending</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                  ₹{analytics.summary.totalSpending.toFixed(0)}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Total Expenses</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {analytics.summary.expenseCount}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-400 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Average Expense</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                  ₹{analytics.summary.averageExpense.toFixed(0)}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Recurring/Month</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                  ₹{analytics.summary.recurringMonthlyTotal.toFixed(0)}
                </p>
              </motion.div>
            </div>

            {/* Category Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 mb-8"
            >
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">
                Spending by Category
              </h2>
              <div className="space-y-4">
                {analytics.categoryBreakdown.map((cat, index) => {
                  const percentage = (cat.total / analytics.summary.totalSpending) * 100;
                  return (
                    <div key={cat.category}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{CATEGORY_ICONS[cat.category]}</span>
                          <div>
                            <p className="font-semibold text-zinc-900 dark:text-white capitalize">
                              {cat.category}
                            </p>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                              {cat.count} expenses · Avg ₹{cat.average.toFixed(0)}
                            </p>
                          </div>
                        </div>
                        <p className="text-lg font-bold text-zinc-900 dark:text-white">
                          ₹{cat.total.toFixed(0)}
                        </p>
                      </div>
                      <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                          className={`h-2 rounded-full ${CATEGORY_COLORS[cat.category]}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Monthly Trend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 mb-8"
            >
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">
                Monthly Trend
              </h2>
              <div className="space-y-4">
                {analytics.monthlyTrend.map((month, index) => {
                  const maxTotal = Math.max(...analytics.monthlyTrend.map((m) => m.total));
                  const percentage = (month.total / maxTotal) * 100;
                  const prevMonth = analytics.monthlyTrend[index - 1];
                  const change = prevMonth ? ((month.total - prevMonth.total) / prevMonth.total) * 100 : 0;

                  return (
                    <div key={month.month}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <p className="font-semibold text-zinc-900 dark:text-white w-24">
                            {month.month}
                          </p>
                          {change !== 0 && (
                            <div className={`flex items-center gap-1 text-sm ${change > 0 ? "text-red-500" : "text-green-500"}`}>
                              {change > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                              {Math.abs(change).toFixed(1)}%
                            </div>
                          )}
                        </div>
                        <p className="text-lg font-bold text-zinc-900 dark:text-white">
                          ₹{month.total.toFixed(0)}
                        </p>
                      </div>
                      <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                          className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Top Expenses & Recurring */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Expenses */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800"
              >
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">
                  Top 5 Expenses
                </h2>
                <div className="space-y-4">
                  {analytics.topExpenses.map((expense, index) => (
                    <div key={expense._id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-600 dark:text-zinc-400">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-900 dark:text-white">
                            {expense.description}
                          </p>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400 capitalize">
                            {expense.category}
                          </p>
                        </div>
                      </div>
                      <p className="text-lg font-bold text-zinc-900 dark:text-white">
                        ₹{expense.amount.toFixed(0)}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Recurring Expenses */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800"
              >
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">
                  Recurring Expenses
                </h2>
                {analytics.recurringExpenses.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.recurringExpenses.map((expense) => (
                      <div key={expense._id} className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-zinc-900 dark:text-white">
                            {expense.description}
                          </p>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400 capitalize">
                            {expense.frequency} · Next: {new Date(expense.nextDate).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-lg font-bold text-zinc-900 dark:text-white">
                          ₹{expense.amount.toFixed(0)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-zinc-500 dark:text-zinc-400 mb-4">
                      No recurring expenses yet
                    </p>
                    <Link href="/dashboard/expenses">
                      <Button size="sm">Create Recurring Expense</Button>
                    </Link>
                  </div>
                )}
              </motion.div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
