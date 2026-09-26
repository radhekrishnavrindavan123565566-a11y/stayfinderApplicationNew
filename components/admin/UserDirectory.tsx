'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Phone,
  MapPin,
  Calendar,
  Shield,
  AlertCircle,
  CheckCircle,
  Ban,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Loader,
  Home,
  MessageSquare,
  Clock,
} from 'lucide-react';
import axios from 'axios';
import { useApi } from '@/hooks/useApi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface User {
  _id: string;
  username: string;
  email: string;
  phone: string;
  city?: string;
  registrationDate: string;
  lastActivity: string;
  isActive: boolean;
  isVerified?: boolean;
  ownerVerified?: boolean;
  role: 'owner' | 'tenant' | 'admin';
  propertyCount?: number;
  totalListings?: number;
  activeListings?: number;
  inquiriesCount?: number;
  activeInquiries?: number;
  bookingsCount?: number;
  responseRate?: number;
  trustBadges?: string[];
  fraudRiskLevel?: string;
}

interface UserDirectoryProps {
  onUserSelect?: (user: User) => void;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function UserDirectory({ onUserSelect }: UserDirectoryProps) {
  const [userType, setUserType] = useState<'owners' | 'tenants'>('owners');
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'active'>('recent');
  const [verifiedFilter, setVerifiedFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const { authHeaders } = useApi();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        '/api/admin/users',
        {
          params: {
            page,
            limit,
            role: userType === 'owners' ? 'owner' : 'tenant',
            search: searchQuery,
            sortBy,
          },
          ...authHeaders(),
        }
      );

      const userData = response.data.users || [];
      setUsers(userData);
      setTotal(response.data.total || 0);
    } catch (err) {
      setError('Failed to load users');
      console.error('User fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [userType, searchQuery, sortBy, verifiedFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [page, limit, userType, searchQuery, sortBy]);

  useEffect(() => {
    let filtered = users;

    if (verifiedFilter === 'verified') {
      filtered = filtered.filter((u) => u.isVerified || u.ownerVerified);
    } else if (verifiedFilter === 'unverified') {
      filtered = filtered.filter((u) => !u.isVerified && !u.ownerVerified);
    }

    if (statusFilter === 'active') {
      filtered = filtered.filter((u) => u.isActive);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter((u) => !u.isActive);
    }

    setFilteredUsers(filtered);
  }, [users, verifiedFilter, statusFilter]);

  const handleBlockUser = async (userId: string, currentStatus: boolean) => {
    setActionLoading((prev) => ({ ...prev, [userId]: true }));
    try {
      await axios.patch(
        `/api/admin/users/${userId}`,
        { isActive: !currentStatus },
        authHeaders()
      );
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, isActive: !currentStatus } : u
        )
      );
      toast.success(
        !currentStatus
          ? 'User activated successfully'
          : 'User blocked successfully'
      );
    } catch (err) {
      toast.error('Failed to update user status');
      console.error('Block user error:', err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleCallUser = (phone: string) => {
    if (!phone) {
      toast.error('Phone number not available');
      return;
    }
    window.location.href = `tel:${phone}`;
    toast.success(`Calling ${phone}...`);
  };

  const handleMessageUser = (phone: string) => {
    if (!phone) {
      toast.error('Phone number not available');
      return;
    }
    window.location.href = `sms:${phone}`;
    toast.success(`Opening SMS for ${phone}...`);
  };

  const downloadUsersList = () => {
    if (filteredUsers.length === 0) {
      toast.error('No users to download');
      return;
    }

    const headers = [
      'Username',
      'Email',
      'Phone',
      'City',
      ...(userType === 'owners'
        ? ['Properties', 'Active', 'Verified', 'Response Rate']
        : ['Inquiries', 'Active', 'Bookings', 'Verified']),
      'Joined',
    ];

    const rows = filteredUsers.map((u) => [
      u.username || '',
      u.email || '',
      u.phone || '',
      u.city || '',
      ...(userType === 'owners'
        ? [
            u.propertyCount || 0,
            u.activeListings || 0,
            u.ownerVerified ? 'Yes' : 'No',
            `${u.responseRate || 0}%`,
          ]
        : [
            u.inquiriesCount || 0,
            u.activeInquiries || 0,
            u.bookingsCount || 0,
            u.isVerified ? 'Yes' : 'No',
          ]),
      u.registrationDate
        ? format(new Date(u.registrationDate), 'MMM d, yyyy')
        : '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(',')
      ),
    ].join('\n');

    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent)
    );
    element.setAttribute(
      'download',
      `${userType}_${format(new Date(), 'yyyy-MM-dd_HHmmss')}.csv`
    );
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success(`Downloaded ${filteredUsers.length} ${userType}`);
  };

  const getRiskBadge = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400">
            <AlertCircle className="w-3 h-3" />
            High Risk
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400">
            <Clock className="w-3 h-3" />
            Medium Risk
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400">
            <CheckCircle className="w-3 h-3" />
            Low Risk
          </span>
        );
      default:
        return null;
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white mb-2">
            User Directory
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Manage {userType === 'owners' ? 'property owners' : 'tenants'} on the
            platform
          </p>
        </div>
        <button
          onClick={downloadUsersList}
          className="flex items-center gap-2 bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download CSV
        </button>
      </motion.div>

      {/* User Type Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800"
      >
        <div className="flex items-center gap-2">
          {(
            [
              { key: 'owners', label: 'Owners', icon: Home },
              { key: 'tenants', label: 'Tenants', icon: Users },
            ] as const
          ).map(({ key, label, icon: Icon }) => (
            <motion.button
              key={key}
              onClick={() => setUserType(key)}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                userType === key
                  ? 'bg-rose-500 text-white'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800"
      >
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'recent' | 'name' | 'active')}
            className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="recent">Most Recent</option>
            <option value="name">Name (A-Z)</option>
            <option value="active">Recently Active</option>
          </select>

          {/* Verification Filter */}
          <select
            value={verifiedFilter}
            onChange={(e) =>
              setVerifiedFilter(e.target.value as 'all' | 'verified' | 'unverified')
            }
            className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="all">All Users</option>
            <option value="verified">Verified Only</option>
            <option value="unverified">Unverified Only</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')
            }
            className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Refresh */}
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-rose-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-zinc-600 dark:text-zinc-400">{error}</p>
              <button
                onClick={fetchUsers}
                className="mt-4 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600"
              >
                Retry
              </button>
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-600 dark:text-zinc-400">No users found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      {userType === 'owners' ? 'Properties' : 'Activity'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Risk
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {filteredUsers.map((user) => (
                    <motion.tr
                      key={user._id}
                      variants={fadeUp}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-zinc-900 dark:text-white">
                            {user.username}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {user.email}
                          </p>
                          {user.trustBadges && user.trustBadges.length > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              {user.trustBadges.map((badge) => (
                                <span
                                  key={badge}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                                >
                                  <Shield className="w-3 h-3" />
                                  {badge}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {user.phone && (
                            <div className="flex items-center gap-1 text-sm text-zinc-600 dark:text-zinc-400">
                              <Phone className="w-3 h-3" />
                              {user.phone}
                            </div>
                          )}
                          {user.city && (
                            <div className="flex items-center gap-1 text-sm text-zinc-600 dark:text-zinc-400">
                              <MapPin className="w-3 h-3" />
                              {user.city}
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-500">
                            <Calendar className="w-3 h-3" />
                            {user.registrationDate
                              ? format(new Date(user.registrationDate), 'MMM d, yyyy')
                              : 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1 text-sm">
                          {userType === 'owners' ? (
                            <>
                              <div className="flex items-center gap-2">
                                <Home className="w-3 h-3 text-zinc-400" />
                                <span className="font-medium text-zinc-900 dark:text-white">
                                  {user.propertyCount || 0}
                                </span>
                                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                  total
                                </span>
                              </div>
                              <div className="text-xs text-zinc-600 dark:text-zinc-400">
                                {user.activeListings || 0} active · {user.responseRate || 0}%
                                response
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center gap-2">
                                <MessageSquare className="w-3 h-3 text-zinc-400" />
                                <span className="font-medium text-zinc-900 dark:text-white">
                                  {user.inquiriesCount || 0}
                                </span>
                                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                  inquiries
                                </span>
                              </div>
                              <div className="text-xs text-zinc-600 dark:text-zinc-400">
                                {user.activeInquiries || 0} active · {user.bookingsCount || 0}{' '}
                                bookings
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                            user.isActive
                              ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                          }`}
                        >
                          {user.isActive ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              Active
                            </>
                          ) : (
                            <>
                              <Ban className="w-3 h-3" />
                              Blocked
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {getRiskBadge(user.fraudRiskLevel)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleCallUser(user.phone)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                            title="Call user"
                          >
                            <Phone className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleMessageUser(user.phone)}
                            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30 rounded-lg transition-colors"
                            title="Send SMS"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleBlockUser(user._id, user.isActive)}
                            disabled={actionLoading[user._id]}
                            className={`p-2 rounded-lg transition-colors ${
                              user.isActive
                                ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30'
                                : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30'
                            } disabled:opacity-50`}
                            title={user.isActive ? 'Block user' : 'Unblock user'}
                          >
                            {actionLoading[user._id] ? (
                              <Loader className="w-4 h-4 animate-spin" />
                            ) : user.isActive ? (
                              <Ban className="w-4 h-4" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Page {page} of {totalPages} • {total} total users
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
