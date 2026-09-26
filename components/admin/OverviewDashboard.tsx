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
  Zap,
} from 'lucide-react';
import axios from 'axios';

interface OverviewDashboardProps {
  onRefresh?: () => Promise<void>;
}

interface EnhancedStats {
  properties?: {
    active: number;
    pending: number;
    inactive: number;
    total: number;
    rejected?: number;
    byStatus?: { [key: string]: number };
  };
  users?: {
    totalOwners: number;
    totalTenants: number;
    verified: number;
    blocked: number;
    newThisWeek?: number;
  };
  inquiries?: {
    today: number;
    thisWeek: number;
    total: number;
    newLeads: number;
    closedDeals: number;
    byStatus?: { [key: string]: number };
  };
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
  recentActivity?: Array<{
    _id: string;
    description: string;
    timestamp: string;
    type?: string;
  }>;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export default function OverviewDashboard({ onRefresh }: OverviewDashboardProps) {
  const [stats, setStats] = useState<EnhancedStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

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

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    await onRefresh?.();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-rose-500 border-t-transparent" />
      </div>
    );
  }

  if (error && !stats) {
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

  const totalUsers = (stats.users?.totalOwners || 0) + (stats.users?.totalTenants || 0);
  const totalBookings = (stats.bookings?.confirmed || 0) + (stats.bookings?.ongoing || 0);
  const propertiesGrowth = stats.growthMetrics?.propertiesGrowth || 0;
  const usersGrowth = stats.growthMetrics?.usersGrowth || 0;
  const inquiriesGrowth = stats.growthMetrics?.inquiriesGrowth || 0;

  const statCards = [
    {
      title: 'Active Properties',
      value: stats.properties?.active || 0,
      subtext: `${stats.properties?.pending || 0} pending`,
      growth: propertiesGrowth,
      icon: <Home className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      title: 'Total Users',
      value: totalUsers,
      subtext: `${stats.users?.totalOwners || 0} owners • ${stats.users?.totalTenants || 0} tenants`,
      growth: usersGrowth,
      icon: <Users className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-400',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
    },
    {
      title: 'New Inquiries (Today)',
      value: stats.inquiries?.today || 0,
      subtext: `${stats.inquiries?.thisWeek || 0} this week`,
      growth: inquiriesGrowth,
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'from-purple-500 to-violet-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    },
    {
      title: 'Active Bookings',
      value: totalBookings,
      subtext: `${stats.bookings?.completed || 0} completed`,
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
            Overview Dashboard
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Real-time platform overview and key metrics
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </motion.button>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={stagger}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {statCards.map((card, index) => (
          <motion.div key={index} variants={fadeUp}>
            <div
              className={`${card.bgColor} rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 hover:shadow-lg transition-all cursor-pointer group`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-zinc-700 dark:text-zinc-300 text-sm">
                  {card.title}
                </h3>
                <div
                  className={`bg-gradient-to-br ${card.color} p-3 rounded-lg text-white transform group-hover:scale-110 transition-transform`}
                >
                  {card.icon}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-black text-zinc-900 dark:text-white">
                  {card.value}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {card.subtext}
                </p>
                {card.growth !== undefined && card.growth !== 0 && (
                  <div className="flex items-center gap-1 pt-2">
                    {card.growth >= 0 ? (
                      <ArrowUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <ArrowDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                    )}
                    <span className={card.growth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                      {Math.abs(card.growth)}%
                    </span>
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
                  {stats.properties?.active || 0}
                </span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${(stats.properties?.active || 0) / (stats.properties?.total || 1) * 100}%`,
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
                  {stats.properties?.pending || 0}
                </span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${(stats.properties?.pending || 0) / (stats.properties?.total || 1) * 100}%`,
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
                  {stats.properties?.inactive || 0}
                </span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${(stats.properties?.inactive || 0) / (stats.properties?.total || 1) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <div className="text-sm text-zinc-600 dark:text-zinc-400">Total Properties</div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                {stats.properties?.total || 0}
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
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                New Leads (24h)
              </span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {stats.inquiries?.today || 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Closed Deals
              </span>
              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                {stats.inquiries?.closedDeals || 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Total Inquiries
              </span>
              <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {stats.inquiries?.total || 0}
              </span>
            </div>

            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <div className="text-sm text-zinc-600 dark:text-zinc-400">Conversion Rate</div>
              <div className="text-3xl font-bold text-zinc-900 dark:text-white">
                {stats.inquiries?.total ? ((stats.inquiries.closedDeals / stats.inquiries.total) * 100).toFixed(1) : 0}%
              </div>
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
          {stats.recentActivity && stats.recentActivity.length > 0 ? (
            stats.recentActivity.slice(0, 10).map((activity) => (
              <motion.div
                key={activity._id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between py-3 border-b border-zinc-100 dark:border-zinc-800 last:border-b-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 px-3 rounded transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                {activity.type && (
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex-shrink-0 ml-2">
                    {activity.type}
                  </span>
                )}
              </motion.div>
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
