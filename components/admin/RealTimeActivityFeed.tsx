'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Home,
  Users,
  MessageSquare,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Search,
  RefreshCw,
  Wifi,
  WifiOff,
  ChevronLeft,
  ChevronRight,
  Filter,
  Trash2,
  Bell,
  UserPlus,
  Edit,
  TrendingUp,
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useApi } from '@/hooks/useApi';
import { format, formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  _id: string;
  type: string;
  title: string;
  description: string;
  metadata?: Record<string, unknown>;
  severity?: 'low' | 'medium' | 'high';
  timestamp: string;
  createdAt: string;
}

const TYPE_CONFIG: Record<
  string,
  { icon: React.ReactNode; color: string; bg: string; label: string }
> = {
  user_registered: {
    icon: <UserPlus className="w-4 h-4" />,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    label: 'New User',
  },
  user_updated: {
    icon: <Users className="w-4 h-4" />,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    label: 'User Updated',
  },
  property_added: {
    icon: <Home className="w-4 h-4" />,
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-950/40',
    label: 'New Property',
  },
  property_updated: {
    icon: <Edit className="w-4 h-4" />,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    label: 'Property Updated',
  },
  rent_updated: {
    icon: <DollarSign className="w-4 h-4" />,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    label: 'Rent Updated',
  },
  property_rented: {
    icon: <CheckCircle className="w-4 h-4" />,
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-950/40',
    label: 'Property Rented',
  },
  inquiry_received: {
    icon: <MessageSquare className="w-4 h-4" />,
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    label: 'New Inquiry',
  },
  inquiry_updated: {
    icon: <TrendingUp className="w-4 h-4" />,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    label: 'Inquiry Updated',
  },
  booking_created: {
    icon: <CheckCircle className="w-4 h-4" />,
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-950/40',
    label: 'Booking',
  },
  payment_received: {
    icon: <DollarSign className="w-4 h-4" />,
    color: 'text-green-700 dark:text-green-300',
    bg: 'bg-green-50 dark:bg-green-950/40',
    label: 'Payment',
  },
  dispute_raised: {
    icon: <AlertTriangle className="w-4 h-4" />,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/40',
    label: 'Dispute',
  },
};

const SEVERITY_DOT: Record<string, string> = {
  low: 'bg-zinc-400',
  medium: 'bg-amber-500',
  high: 'bg-rose-500',
};

const ALL_TYPES = Object.keys(TYPE_CONFIG);

export default function RealTimeActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [newCount, setNewCount] = useState(0);
  const limit = 20;
  const { authHeaders } = useApi();
  const esRef = useRef<EventSource | null>(null);

  // ── Initial & paginated fetch ────────────────────────────────────────────────
  const fetchActivities = async (resetPage = false) => {
    try {
      setLoading(true);
      const p = resetPage ? 1 : page;
      if (resetPage) setPage(1);

      const params = new URLSearchParams({
        page: p.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
        ...(timeRange !== 'all' && { timeRange }),
      });

      const res = await axios.get(`/api/admin/activities?${params}`, authHeaders());
      setActivities(res.data.activities || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
      setNewCount(0);
    } catch {
      toast.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, typeFilter, timeRange]);

  useEffect(() => {
    fetchActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // ── SSE real-time connection ─────────────────────────────────────────────────
  useEffect(() => {
    const es = new EventSource('/api/admin/activities/stream');
    esRef.current = es;

    es.addEventListener('connected', () => setConnected(true));
    es.addEventListener('ping', () => {/* keep-alive */});
    es.addEventListener('activity', (e) => {
      try {
        const item: ActivityItem = JSON.parse(e.data);
        // Prepend to list only if we are on page 1 and no active filters
        if (page === 1 && !search && typeFilter === 'all' && timeRange === 'all') {
          setActivities((prev) => [item, ...prev].slice(0, limit));
          setTotal((t) => t + 1);
        } else {
          setNewCount((n) => n + 1);
        }
      } catch { /* parse error */ }
    });

    es.onerror = () => {
      setConnected(false);
      es.close();
      // Reconnect after 5 s
      setTimeout(() => {
        if (esRef.current === es) {
          const next = new EventSource('/api/admin/activities/stream');
          esRef.current = next;
        }
      }, 5_000);
    };

    return () => { es.close(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClearAll = async () => {
    if (!confirm('Clear all activity logs? This cannot be undone.')) return;
    try {
      await axios.delete('/api/admin/activities', authHeaders());
      setActivities([]);
      setTotal(0);
      toast.success('Activity log cleared');
    } catch {
      toast.error('Failed to clear activities');
    }
  };

  const cfg = (type: string) => TYPE_CONFIG[type] ?? {
    icon: <Bell className="w-4 h-4" />,
    color: 'text-zinc-600 dark:text-zinc-400',
    bg: 'bg-zinc-50 dark:bg-zinc-800/50',
    label: type,
  };

  return (
    <div className="space-y-5">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-rose-500" />
            Real-Time Activity Feed
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            {total} total events
            {newCount > 0 && (
              <button
                onClick={() => fetchActivities(true)}
                className="ml-2 text-rose-500 font-semibold hover:underline"
              >
                +{newCount} new — click to refresh
              </button>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Live indicator */}
          <span
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${
              connected
                ? 'text-green-700 border-green-200 bg-green-50 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800'
                : 'text-zinc-500 border-zinc-200 bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700'
            }`}
          >
            {connected ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <Wifi className="w-3.5 h-3.5" /> Live
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5" /> Reconnecting…
              </>
            )}
          </span>

          <button
            onClick={() => fetchActivities(true)}
            disabled={loading}
            className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleClearAll}
            className="p-2 rounded-lg border border-red-200 dark:border-red-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
            title="Clear all logs"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Filters ────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search activities…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="all">All Event Types</option>
            {ALL_TYPES.map((t) => (
              <option key={t} value={t}>{TYPE_CONFIG[t].label}</option>
            ))}
          </select>

          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* ── Feed ───────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-rose-500 border-t-transparent" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-16">
            <Activity className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-500 dark:text-zinc-400">No activity found</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {activities.map((item, i) => {
                const c = cfg(item.type);
                const ts = item.timestamp || item.createdAt;
                return (
                  <motion.li
                    key={item._id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: i < 5 ? i * 0.04 : 0 }}
                    className="flex items-start gap-4 px-5 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    {/* Type icon */}
                    <div className={`flex-shrink-0 p-2 rounded-lg ${c.bg} ${c.color} mt-0.5`}>
                      {c.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.bg} ${c.color}`}>
                          {c.label}
                        </span>
                        {item.severity && (
                          <span className={`w-2 h-2 rounded-full ${SEVERITY_DOT[item.severity]}`} title={`${item.severity} severity`} />
                        )}
                      </div>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-white mt-1 truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                        {item.description}
                      </p>

                      {/* Metadata quick view */}
                      {item.metadata && Object.keys(item.metadata).length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-1.5">
                          {item.metadata.tenantPhone && (
                            <a
                              href={`tel:${item.metadata.tenantPhone}`}
                              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              📞 {String(item.metadata.tenantPhone)}
                            </a>
                          )}
                          {item.metadata.tenantEmail && (
                            <a
                              href={`mailto:${item.metadata.tenantEmail}`}
                              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              ✉️ {String(item.metadata.tenantEmail)}
                            </a>
                          )}
                          {item.metadata.oldRent && item.metadata.newRent && (
                            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                              ₹{Number(item.metadata.oldRent).toLocaleString('en-IN')} → ₹{Number(item.metadata.newRent).toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div className="flex-shrink-0 text-right">
                      <p className="text-xs text-zinc-400 dark:text-zinc-500">
                        {ts ? formatDistanceToNow(new Date(ts), { addSuffix: true }) : '—'}
                      </p>
                      {ts && (
                        <p className="text-xs text-zinc-300 dark:text-zinc-600 mt-0.5">
                          {format(new Date(ts), 'MMM d, HH:mm')}
                        </p>
                      )}
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          </AnimatePresence>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              Page {page} of {totalPages} · {total} events
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
