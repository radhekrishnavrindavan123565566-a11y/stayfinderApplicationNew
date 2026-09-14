'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Home,
  Users,
  MessageSquare,
  DollarSign,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  BarChart3,
  LineChart,
  Flag,
} from 'lucide-react';
import axios from 'axios';
import type { DashboardStats } from '@/lib/admin/models';

interface OverviewDashboardProps {
  onRefresh?: () => Promise<void>;
}

interface EnhancedStats extends DashboardStats {
  bookings?: {
    confirmed: number;
    ongoing: number;
    completed: number;
    cancelled: number;
  };
  growthMetrics?: {
    propertiesGrowth: number;
    usersGrowth: number;
    inquiriesGrowth: number;
  };
  topCities?: Array<{ city: string; count: number }>;
  conversionRate?: number;
  analyticsData?: {
    listingsPerWeek: Array<{ week: string; count: number }>;
  };
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function OverviewDashboard({ onRefresh }: OverviewDashboardProps) {
  const [stats, setStats] = useState<EnhancedStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/admin/stats');
      setStats(response.data);
    } catch (err) {
      setError('Failed to load dashboard stats');
      console.error('Dashboard stats error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-rose-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-6 border border-red-200 dark:border-red-800">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: 'Total Properties',
      value: stats.properties.total,
      subtext: `${stats.properties.active} active • ${stats.properties.rejected || 0} rejected`,
      growth: stats.growthMetrics?.propertiesGrowth || 0,
      icon: <Home className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      title: 'Total Users',
      value: stats.users.totalOwners + stats.users.totalTenants,
      subtext: `${stats.users.verified} verified • +${stats.growthMetrics?.usersGrowth || 0}% vs last month`,
      growth: stats.growthMetrics?.usersGrowth || 0,
      icon: <Users className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-400',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
    },
    {
      title: 'New Inquiries',
      value: stats.inquiries.today,
      subtext: `${stats.inquiries.thisWeek} this week • ${stats.conversionRate?.toFixed(1) || 0}% conversion`,
      growth: stats.growthMetrics?.inquiriesGrowth || 0,
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'from-purple-500 to-violet-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    },
    {
      title: 'Total Bookings',
      value: (stats.bookings?.confirmed || 0) + (stats.bookings?.ongoing || 0),
      subtext: `${stats.bookings?.completed || 0} completed • ${stats.bookings?.cancelled || 0} cancelled`,
      icon: <DollarSign className="w-6 h-6" />,
      color: 'from-amber-500 to-orange-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={fadeUp}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Real-time platform overview and key metrics
          </p>
        </div>
        <button
          onClick={() => {
            fetchStats();
            onRefresh?.();
          }}
          className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          show: { transition: { staggerChildren: 0.1 } },
        }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {statCards.map((card, index) => (
          <motion.div key={index} variants={fadeUp}>
            <div
              className={`${card.bgColor} rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 hover:shadow-lg transition-all`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-zinc-700 dark:text-zinc-300">
                  {card.title}
                </h3>
                <div
                  className={`bg-gradient-to-br ${card.color} p-3 rounded-lg text-white`}
                >
                  {card.icon}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-black text-zinc-900 dark:text-white">
                  {card.value}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {card.subtext}
                </p>
                {card.growth !== undefined && card.growth !== 0 && (
                  <div className={`text-xs font-semibold flex items-center gap-1 ${
                    card.growth > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {card.growth > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {Math.abs(card.growth)}% vs last month
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Status Overview */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={fadeUp}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Properties by Status */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
            <Home className="w-5 h-5 text-blue-500" />
            Properties by Status
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  Active
                </span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                  {stats.properties.active}
                </span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${(stats.properties.active / stats.properties.total) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  Pending
                </span>
                <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                  {stats.properties.pending}
                </span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2">
                <div
                  className="bg-amber-500 h-2 rounded-full"
                  style={{
                    width: `${(stats.properties.pending / stats.properties.total) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  Inactive
                </span>
                <span className="text-lg font-bold text-red-600 dark:text-red-400">
                  {stats.properties.inactive}
                </span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{
                    width: `${(stats.properties.inactive / stats.properties.total) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Leads Overview */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-500" />
            Leads Overview
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                New Leads
              </span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {stats.inquiries.newLeads}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Closed Deals
              </span>
              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                {stats.inquiries.closedDeals}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Total Inquiries
              </span>
              <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {stats.inquiries.total}
              </span>
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                Conversion Rate
              </div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                {stats.inquiries.total > 0
                  ? ((stats.inquiries.closedDeals / stats.inquiries.total) * 100).toFixed(1)
                  : 0}
                %
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Analytics Widgets */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={fadeUp}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Top Cities */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            Top 5 Cities by Inquiries
          </h2>
          <div className="space-y-3">
            {stats.topCities && stats.topCities.length > 0 ? (
              stats.topCities.slice(0, 5).map((city, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      {index + 1}. {city.city}
                    </span>
                    <span className="text-sm font-bold text-zinc-900 dark:text-white">
                      {city.count} inquiries
                    </span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full"
                      style={{
                        width: `${(city.count / (stats.topCities?.[0]?.count || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No data available</p>
            )}
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
            <LineChart className="w-5 h-5 text-purple-500" />
            Conversion Funnel
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Total Inquiries
                </span>
                <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {stats.inquiries.total}
                </span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full w-full" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Visit Scheduled
                </span>
                <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                  ~{Math.round((stats.inquiries.total * 0.4))}
                </span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2">
                <div
                  className="bg-amber-500 h-2 rounded-full"
                  style={{ width: '40%' }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Closed - Booked
                </span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                  {stats.inquiries.closedDeals}
                </span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${(stats.inquiries.closedDeals / stats.inquiries.total) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Conversion Rate</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                {stats.conversionRate?.toFixed(1) || ((stats.inquiries.closedDeals / stats.inquiries.total) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* Alert Items */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
            <Flag className="w-5 h-5 text-red-500" />
            Items Needing Action
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
              <div>
                <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                  Pending Approval
                </p>
                <p className="text-xs text-amber-800 dark:text-amber-300">
                  Properties awaiting review
                </p>
              </div>
              <span className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                {stats.properties.pending}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                  New Leads (Unread)
                </p>
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  Inquiries from last 24h
                </p>
              </div>
              <span className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                {stats.inquiries.today}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
              <div>
                <p className="text-sm font-medium text-red-900 dark:text-red-200">
                  Flagged Users
                </p>
                <p className="text-xs text-red-800 dark:text-red-300">
                  High fraud risk accounts
                </p>
              </div>
              <span className="text-2xl font-bold text-red-700 dark:text-red-400">
                {stats.users.blocked}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={fadeUp}
        className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800"
      >
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-rose-500" />
          Recent Activity
        </h2>
        <div className="space-y-3">
          {stats.recentActivity.length > 0 ? (
            stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-zinc-100 dark:border-zinc-800 last:border-b-0">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">
                      {activity.description}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 py-4">
              No recent activity
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
