'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Home,
  Users,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle,
  Activity,
  Building2,
  UserCheck,
  MessageSquare,
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useApi } from '@/hooks/useApi';
import { format, startOfToday, startOfWeek } from 'date-fns';

interface StatCard {
  label: string;
  value: number | string;
  subValue?: string;
  icon: React.ReactNode;
  color: string;
  trend?: { value: number; direction: 'up' | 'down' | 'neutral' };
}

interface ActivityItem {
  _id: string;
  type: 'property' | 'inquiry';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
  icon: React.ReactNode;
  color: string;
}

interface InquiryCount {
  today: number;
  thisWeek: number;
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [inquiryCounts, setInquiryCounts] = useState<InquiryCount>({ today: 0, thisWeek: 0 });
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { authHeaders } = useApi();

  useEffect(() => {
    loadDashboardData();
    // Refresh activity feed every 30 seconds for real-time updates
    const interval = setInterval(loadActivityFeed, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, inquiriesRes, propertiesRes] = await Promise.all([
        axios.get('/api/admin/stats', authHeaders()),
        axios.get('/api/admin/inquiries', { ...authHeaders(), params: { limit: 1000 } }),
        axios.get('/api/admin/properties', authHeaders()),
      ]);

      // Process stats
      const rawStats = statsRes?.data || {};
      const processedStats = {
        totalProperties: rawStats.properties?.total || 0,
        activeProperties: rawStats.properties?.active || 0,
        pendingProperties: rawStats.properties?.pending || 0,
        inactiveProperties: rawStats.properties?.inactive || 0,
        totalOwners: rawStats.users?.totalOwners || 0,
        totalTenants: rawStats.users?.totalTenants || 0,
        totalBookings: (rawStats.bookings?.confirmed || 0) + (rawStats.bookings?.ongoing || 0),
      };
      setStats(processedStats);

      // Process inquiry counts
      const inquiries = inquiriesRes?.data?.inquiries || [];
      const today = startOfToday();
      const weekStart = startOfWeek(new Date());

      const todayInquiries = inquiries.filter((i: any) => {
        const inquiryDate = new Date(i.inquiryDate || i.createdAt);
        return inquiryDate >= today;
      }).length;

      const weekInquiries = inquiries.filter((i: any) => {
        const inquiryDate = new Date(i.inquiryDate || i.createdAt);
        return inquiryDate >= weekStart;
      }).length;

      setInquiryCounts({ today: todayInquiries, thisWeek: weekInquiries });

      // Load activity feed
      await loadActivityFeed(propertiesRes?.data?.properties || [], inquiries);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadActivityFeed = async (properties?: any[], inquiries?: any[]) => {
    try {
      let propertiesData = properties;
      let inquiriesData = inquiries;

      if (!propertiesData) {
        const propsRes = await axios.get('/api/admin/properties', authHeaders());
        propertiesData = propsRes?.data?.properties || [];
      }

      if (!inquiriesData) {
        const inquiresRes = await axios.get('/api/admin/inquiries', { ...authHeaders(), params: { limit: 100 } });
        inquiriesData = inquiresRes?.data?.inquiries || [];
      }

      // Create activity items from recent properties and inquiries
      const activityItems: ActivityItem[] = [];

      // Add recent properties
      if (Array.isArray(propertiesData)) {
        propertiesData.slice(0, 5).forEach((p: any) => {
          activityItems.push({
            _id: `prop-${p._id}`,
            type: 'property',
            title: p.title || 'Untitled Property',
            description: `Posted in ${p.location?.city || 'N/A'} by ${p.ownerName || 'Anonymous'}`,
            timestamp: p.createdAt,
            status: p.status,
            icon: <Building2 className="w-5 h-5" />,
            color: 'bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
          });
        });
      }

      // Add recent inquiries
      if (Array.isArray(inquiriesData)) {
        inquiriesData.slice(0, 5).forEach((i: any) => {
          activityItems.push({
            _id: `inq-${i._id}`,
            type: 'inquiry',
            title: `Inquiry from ${i.tenantName || 'Anonymous'}`,
            description: `Interested in ${i.propertyTitle || 'a property'}`,
            timestamp: i.inquiryDate || i.createdAt,
            status: i.status,
            icon: <MessageSquare className="w-5 h-5" />,
            color: 'bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400',
          });
        });
      }

      // Sort by timestamp (newest first)
      activityItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setActivityFeed(activityItems.slice(0, 8));
    } catch (error) {
      console.error('Failed to load activity feed:', error);
    }
  };

  const statCards: StatCard[] = [
    {
      label: 'Total Properties',
      value: stats?.totalProperties || 0,
      subValue: `${stats?.activeProperties || 0} active`,
      icon: <Home className="w-6 h-6" />,
      color: 'bg-blue-100 dark:bg-blue-950/30',
    },
    {
      label: 'Active Properties',
      value: stats?.activeProperties || 0,
      icon: <CheckCircle className="w-6 h-6 text-green-600" />,
      color: 'bg-green-100 dark:bg-green-950/30',
    },
    {
      label: 'Pending Approval',
      value: stats?.pendingProperties || 0,
      icon: <Clock className="w-6 h-6 text-amber-600" />,
      color: 'bg-amber-100 dark:bg-amber-950/30',
    },
    {
      label: 'Total Owners',
      value: stats?.totalOwners || 0,
      icon: <UserCheck className="w-6 h-6 text-purple-600" />,
      color: 'bg-purple-100 dark:bg-purple-950/30',
    },
    {
      label: 'Total Tenants',
      value: stats?.totalTenants || 0,
      icon: <Users className="w-6 h-6 text-indigo-600" />,
      color: 'bg-indigo-100 dark:bg-indigo-950/30',
    },
    {
      label: 'Total Bookings',
      value: stats?.totalBookings || 0,
      icon: <TrendingUp className="w-6 h-6 text-rose-600" />,
      color: 'bg-rose-100 dark:bg-rose-950/30',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-black text-zinc-900 dark:text-white mb-2">
          Admin Dashboard
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Welcome back! Here's an overview of your platform activity.
        </p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {statCards.map((card) => (
          <motion.div
            key={card.label}
            variants={fadeUp}
            whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(0,0,0,0.08)' }}
            className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-zinc-100 dark:border-zinc-800 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color}`}>
                {card.icon}
              </div>
              {card.trend && (
                <div className={`text-xs font-semibold ${card.trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {card.trend.direction === 'up' ? '↑' : '↓'} {Math.abs(card.trend.value)}%
                </div>
              )}
            </div>
            <div className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">
              {card.value}
            </div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              {card.label}
            </div>
            {card.subValue && (
              <div className="text-xs text-zinc-500 dark:text-zinc-500 mt-2">
                {card.subValue}
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Inquiry Counter & Activity Feed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Inquiry Counter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-1"
        >
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-500" />
                New Inquiries
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20 rounded-xl p-4 border border-rose-200 dark:border-rose-800/30">
                <div className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">TODAY</div>
                <div className="text-4xl font-black text-rose-600 dark:text-rose-400">
                  {inquiryCounts.today}
                </div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  New inquiries today
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800/30">
                <div className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">THIS WEEK</div>
                <div className="text-4xl font-black text-amber-600 dark:text-amber-400">
                  {inquiryCounts.thisWeek}
                </div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  Inquiries this week
                </div>
              </div>

              <div className="text-xs text-zinc-500 dark:text-zinc-500 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                💡 Track inquiry patterns to optimize response strategies
              </div>
            </div>
          </div>
        </motion.div>

        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                Real-Time Activity Feed
              </h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                Latest properties and inquiries
              </p>
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {loading ? (
                <div className="px-6 py-8 text-center">
                  <div className="inline-block">
                    <div className="w-8 h-8 border-4 border-zinc-200 dark:border-zinc-700 border-t-rose-500 rounded-full animate-spin" />
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-3">
                    Loading activity...
                  </p>
                </div>
              ) : activityFeed.length > 0 ? (
                activityFeed.map((item, idx) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + idx * 0.06 }}
                    className="px-6 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}>
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-zinc-900 dark:text-white truncate">
                          {item.title}
                        </h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 truncate mt-0.5">
                          {item.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {item.status && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                              {item.status}
                            </span>
                          )}
                          <span className="text-xs text-zinc-500 dark:text-zinc-500">
                            {format(new Date(item.timestamp), 'MMM d, HH:mm')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="px-6 py-8 text-center">
                  <Activity className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    No activity yet
                  </p>
                </div>
              )}
            </div>

            {activityFeed.length > 0 && (
              <div className="px-6 py-3 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800 text-center">
                <button
                  onClick={() => router.push('/admin/activity')}
                  className="text-sm font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors"
                >
                  View All Activity →
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Property Status Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden shadow-sm"
      >
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
            Property Status Breakdown
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
            Distribution of your active, pending, and inactive listings
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-3">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    className="dark:stroke-zinc-700"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="8"
                    strokeDasharray={`${((stats?.activeProperties || 0) / (stats?.totalProperties || 1)) * 282.7} 282.7`}
                    className="transition-all"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-zinc-900 dark:text-white">
                    {stats?.activeProperties || 0}
                  </span>
                </div>
              </div>
              <div className="text-sm font-semibold text-zinc-900 dark:text-white">Active</div>
              <div className="text-xs text-zinc-600 dark:text-zinc-400">
                {stats?.totalProperties ? Math.round(((stats?.activeProperties || 0) / stats.totalProperties) * 100) : 0}%
              </div>
            </div>

            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-3">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    className="dark:stroke-zinc-700"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="8"
                    strokeDasharray={`${((stats?.pendingProperties || 0) / (stats?.totalProperties || 1)) * 282.7} 282.7`}
                    className="transition-all"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-zinc-900 dark:text-white">
                    {stats?.pendingProperties || 0}
                  </span>
                </div>
              </div>
              <div className="text-sm font-semibold text-zinc-900 dark:text-white">Pending</div>
              <div className="text-xs text-zinc-600 dark:text-zinc-400">
                {stats?.totalProperties ? Math.round(((stats?.pendingProperties || 0) / stats.totalProperties) * 100) : 0}%
              </div>
            </div>

            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-3">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    className="dark:stroke-zinc-700"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="8"
                    strokeDasharray={`${((stats?.inactiveProperties || 0) / (stats?.totalProperties || 1)) * 282.7} 282.7`}
                    className="transition-all"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-zinc-900 dark:text-white">
                    {stats?.inactiveProperties || 0}
                  </span>
                </div>
              </div>
              <div className="text-sm font-semibold text-zinc-900 dark:text-white">Inactive</div>
              <div className="text-xs text-zinc-600 dark:text-zinc-400">
                {stats?.totalProperties ? Math.round(((stats?.inactiveProperties || 0) / stats.totalProperties) * 100) : 0}%
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
