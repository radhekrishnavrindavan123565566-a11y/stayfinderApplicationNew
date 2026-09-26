'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Home,
  MessageSquare,
  User,
  Calendar,
  Clock,
  MapPin,
  Search,
  Filter,
  Download,
  RefreshCw,
  Loader,
  AlertTriangle,
  Eye,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useApi } from '@/hooks/useApi';
import { format } from 'date-fns';

interface Activity {
  _id: string;
  type: 'property_posted' | 'inquiry_received' | 'booking_created' | 'payment_received' | 'user_joined' | 'review_posted' | 'dispute_raised';
  title: string;
  description: string;
  metadata?: {
    propertyId?: string;
    propertyTitle?: string;
    userId?: string;
    userName?: string;
    inquiryId?: string;
    bookingId?: string;
    amount?: number;
    status?: string;
  };
  timestamp: string;
  severity?: 'low' | 'medium' | 'high';
  icon?: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function ActivityPage() {
  const router = useRouter();
  const { authHeaders } = useApi();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // Mock activity data - will be replaced with real API data
  const mockActivities: Activity[] = [
    {
      _id: '1',
      type: 'property_posted',
      title: 'New Property Posted',
      description: '3BHK Apartment in Bandra posted by Radha Rani',
      metadata: {
        propertyId: 'prop_001',
        propertyTitle: '3BHK Apartment, Bandra',
        userName: 'Radha Rani',
      },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      severity: 'low',
    },
    {
      _id: '2',
      type: 'inquiry_received',
      title: 'New Inquiry Received',
      description: 'New inquiry for "Modern 2BHK" from Priyanka Singh',
      metadata: {
        propertyTitle: 'Modern 2BHK',
        userName: 'Priyanka Singh',
        inquiryId: 'inq_001',
      },
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      severity: 'medium',
    },
    {
      _id: '3',
      type: 'booking_created',
      title: 'Booking Confirmed',
      description: 'Booking confirmed for "Cozy Studio" - Amount: ₹15,000',
      metadata: {
        propertyTitle: 'Cozy Studio',
        amount: 15000,
        status: 'confirmed',
        bookingId: 'book_001',
      },
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      severity: 'high',
    },
    {
      _id: '4',
      type: 'payment_received',
      title: 'Payment Received',
      description: 'Payment of ₹50,000 received from Rahul Kumar',
      metadata: {
        amount: 50000,
        userName: 'Rahul Kumar',
      },
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      severity: 'high',
    },
    {
      _id: '5',
      type: 'user_joined',
      title: 'New User Registration',
      description: 'New tenant "Anjali Sharma" joined the platform',
      metadata: {
        userName: 'Anjali Sharma',
        userId: 'user_001',
      },
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      severity: 'low',
    },
    {
      _id: '6',
      type: 'review_posted',
      title: 'New Review Posted',
      description: '5-star review for "Luxury Penthouse" by Vikram Patel',
      metadata: {
        propertyTitle: 'Luxury Penthouse',
        userName: 'Vikram Patel',
      },
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      severity: 'low',
    },
    {
      _id: '7',
      type: 'dispute_raised',
      title: 'Dispute Raised',
      description: 'Payment dispute raised for booking "Modern 2BHK"',
      metadata: {
        propertyTitle: 'Modern 2BHK',
        status: 'pending',
      },
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      severity: 'high',
    },
    {
      _id: '8',
      type: 'property_posted',
      title: 'New Property Posted',
      description: '1BHK Flat in Andheri posted by Deepak Gupta',
      metadata: {
        propertyId: 'prop_002',
        propertyTitle: '1BHK Flat, Andheri',
        userName: 'Deepak Gupta',
      },
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      severity: 'low',
    },
  ];

  useEffect(() => {
    fetchActivities();
  }, []);

  useEffect(() => {
    filterActivities();
  }, [activities, searchTerm, filterType, timeRange]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search: searchTerm,
        type: filterType !== 'all' ? filterType : '',
        timeRange: timeRange !== 'all' ? timeRange : '',
      });

      const response = await axios.get(`/api/admin/activities?${params}`, authHeaders());
      
      if (response.data?.activities && Array.isArray(response.data.activities)) {
        setActivities(response.data.activities);
        // Optionally fetch total from response
      } else {
        // Fallback to mock data if API doesn't return activities
        await new Promise((resolve) => setTimeout(resolve, 500));
        setActivities(mockActivities.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ));
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      // Fallback to mock data on error
      await new Promise((resolve) => setTimeout(resolve, 500));
      setActivities(mockActivities.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ));
    } finally {
      setLoading(false);
    }
  };

  const filterActivities = () => {
    let filtered = activities;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter((a) => a.type === filterType);
    }

    // Time range filter
    if (timeRange !== 'all') {
      const now = new Date();
      filtered = filtered.filter((a) => {
        const activityTime = new Date(a.timestamp);
        const diffInHours = (now.getTime() - activityTime.getTime()) / (1000 * 60 * 60);

        if (timeRange === 'today') return diffInHours < 24;
        if (timeRange === 'week') return diffInHours < 7 * 24;
        if (timeRange === 'month') return diffInHours < 30 * 24;
        return true;
      });
    }

    setFilteredActivities(filtered);
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'property_posted':
        return <Home className="w-5 h-5" />;
      case 'inquiry_received':
        return <MessageSquare className="w-5 h-5" />;
      case 'booking_created':
        return <Check className="w-5 h-5" />;
      case 'payment_received':
        return <AlertCircle className="w-5 h-5" />;
      case 'user_joined':
        return <User className="w-5 h-5" />;
      case 'review_posted':
        return <Eye className="w-5 h-5" />;
      case 'dispute_raised':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'property_posted':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'inquiry_received':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400';
      case 'booking_created':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'payment_received':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400';
      case 'user_joined':
        return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400';
      case 'review_posted':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400';
      case 'dispute_raised':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      default:
        return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400';
    }
  };

  const getSeverityBadge = (severity?: string) => {
    switch (severity) {
      case 'high':
        return <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full">High</span>;
      case 'medium':
        return <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full">Medium</span>;
      case 'low':
        return <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">Low</span>;
      default:
        return null;
    }
  };

  const paginatedActivities = filteredActivities.slice(
    (page - 1) * limit,
    page * limit
  );
  const totalPages = Math.ceil(filteredActivities.length / limit);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 md:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-zinc-900 dark:text-white">
              All Activity
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">
              Track all platform activities in real-time
            </p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 mb-6"
      >
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Filter controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Activity Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="all">All Types</option>
                <option value="property_posted">Property Posted</option>
                <option value="inquiry_received">Inquiry Received</option>
                <option value="booking_created">Booking Created</option>
                <option value="payment_received">Payment Received</option>
                <option value="user_joined">User Joined</option>
                <option value="review_posted">Review Posted</option>
                <option value="dispute_raised">Dispute Raised</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Time Range
              </label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={fetchActivities}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={() => {
                  // Export functionality can be added here
                  toast.success('Export feature coming soon!');
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Activities List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-12 bg-white dark:bg-zinc-900 rounded-2xl">
            <Loader className="w-8 h-8 text-rose-500 animate-spin" />
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="flex items-center justify-center py-12 bg-white dark:bg-zinc-900 rounded-2xl">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-600 dark:text-zinc-400">No activities found</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {paginatedActivities.map((activity, index) => (
              <motion.div
                key={activity._id}
                variants={fadeUp}
                className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${getActivityColor(
                      activity.type
                    )}`}
                  >
                    {getActivityIcon(activity.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-zinc-900 dark:text-white">
                          {activity.title}
                        </h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">
                          {activity.description}
                        </p>
                        {activity.metadata && (
                          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                            {activity.metadata.propertyTitle && (
                              <span className="flex items-center gap-1">
                                <Home className="w-3 h-3" />
                                {activity.metadata.propertyTitle}
                              </span>
                            )}
                            {activity.metadata.userName && (
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {activity.metadata.userName}
                              </span>
                            )}
                            {activity.metadata.amount && (
                              <span className="flex items-center gap-1">
                                ₹{activity.metadata.amount.toLocaleString()}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Severity and Time */}
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        {getSeverityBadge(activity.severity)}
                        <span className="text-xs text-zinc-500 dark:text-zinc-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(activity.timestamp), 'MMM d, p')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 flex items-center justify-between"
        >
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            Page {page} of {totalPages} • {filteredActivities.length} total activities
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
