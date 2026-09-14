'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Phone,
  Mail,
  MapPin,
  Shield,
  AlertTriangle,
  Check,
  X,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Loader,
  MessageCircle,
  Building2,
  Users,
} from 'lucide-react';
import axios from 'axios';
import type {
  OwnerDirectoryRow,
  TenantDirectoryRow,
  UserFilter,
} from '@/lib/admin/models';

interface UserDirectoryProps {
  onUserSelect?: (user: OwnerDirectoryRow | TenantDirectoryRow) => void;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const riskLevelConfig: Record<string, { color: string; bgColor: string; icon: string }> = {
  low: {
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    icon: '✓',
  },
  medium: {
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    icon: '⚠️',
  },
  high: {
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    icon: '🚫',
  },
};

export default function UserDirectory({ onUserSelect }: UserDirectoryProps) {
  const [userType, setUserType] = useState<'owner' | 'tenant'>('owner');
  const [users, setUsers] = useState<(OwnerDirectoryRow | TenantDirectoryRow)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<UserFilter>({
    role: 'owner',
    verificationStatus: undefined,
    fraudRiskLevel: undefined,
  });
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit,
        role: userType,
        verificationStatus: filters.verificationStatus,
        fraudRiskLevel: filters.fraudRiskLevel,
        search: searchQuery,
      };

      const response = await axios.get('/api/admin/users', { params });
      setUsers(response.data.users);
      setTotal(response.data.total);
    } catch (err) {
      setError('Failed to load users');
      console.error('Users fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [userType, filters, searchQuery]);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, role: userType }));
  }, [userType]);

  useEffect(() => {
    fetchUsers();
  }, [page, limit, filters, searchQuery]);

  const handleSuspend = async (userId: string) => {
    const days = window.prompt('Suspend for how many days? (1-30)');
    if (!days || isNaN(parseInt(days))) return;

    try {
      setActionLoading((prev) => ({ ...prev, [userId]: true }));
      await axios.post(`/api/admin/users/${userId}/suspend`, {
        daysCount: parseInt(days),
        reason: 'Admin suspension',
      });
      fetchUsers();
      alert(`User suspended for ${days} days`);
    } catch (err) {
      console.error('Error suspending user:', err);
      alert('Failed to suspend user');
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleBlock = async (userId: string) => {
    const reason = window.prompt('Reason for permanent block:\n1. Fraud\n2. Harassment\n3. Spam\n4. Policy violation\n5. Other');
    if (!reason) return;

    try {
      setActionLoading((prev) => ({ ...prev, [userId]: true }));
      await axios.post(`/api/admin/users/${userId}/block`, { reason });
      fetchUsers();
      alert('User permanently blocked');
    } catch (err) {
      console.error('Error blocking user:', err);
      alert('Failed to block user');
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleUnblock = async (userId: string) => {
    try {
      setActionLoading((prev) => ({ ...prev, [userId]: true }));
      await axios.post(`/api/admin/users/${userId}/unblock`);
      fetchUsers();
    } catch (err) {
      console.error('Error unblocking user:', err);
      alert('Failed to unblock user');
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const totalPages = Math.ceil(total / limit);
  const isOwnerView = userType === 'owner';

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <motion.div initial="hidden" animate="show" variants={fadeUp} className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white">
            User Directory
          </h1>
          <button
            onClick={() => fetchUsers()}
            className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* User Type Tabs */}
        <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setUserType('owner')}
            className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors ${
              userType === 'owner'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Property Owners
          </button>
          <button
            onClick={() => setUserType('tenant')}
            className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors ${
              userType === 'tenant'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            Tenants
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by name, phone, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Verification Status
            </label>
            <select
              value={filters.verificationStatus || ''}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  verificationStatus: (e.target.value as any) || undefined,
                }))
              }
              className="w-full px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Users</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Fraud Risk Level
            </label>
            <select
              value={filters.fraudRiskLevel || ''}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  fraudRiskLevel: (e.target.value as any) || undefined,
                }))
              }
              className="w-full px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Levels</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Users Table */}
      <motion.div initial="hidden" animate="show" variants={fadeUp}>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-6 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-12 text-center border border-zinc-200 dark:border-zinc-800">
            <p className="text-zinc-600 dark:text-zinc-400">No users found</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                      Name & Contact
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                      {isOwnerView ? 'Properties' : 'Inquiries'}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                      Verification
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                      Risk Level
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {users.map((user) => {
                    const owner = user as OwnerDirectoryRow;
                    const tenant = user as TenantDirectoryRow;
                    const riskConfig =
                      riskLevelConfig[
                        owner.fraudRiskLevel || tenant.fraudRiskLevel || 'low'
                      ];

                    return (
                      <tr
                        key={user._id}
                        className="hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        onClick={() => onUserSelect?.(user)}
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-zinc-900 dark:text-white">
                              {user.username}
                            </p>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {user.phone}
                            </p>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            {isOwnerView ? (
                              <>
                                <p className="font-semibold text-zinc-900 dark:text-white">
                                  {owner.propertyCount}
                                </p>
                                <p className="text-sm text-green-600 dark:text-green-400">
                                  {owner.activeListings} Active
                                </p>
                              </>
                            ) : (
                              <>
                                <p className="font-semibold text-zinc-900 dark:text-white">
                                  {tenant.inquiriesCount}
                                </p>
                                <p className="text-sm text-amber-600 dark:text-amber-400">
                                  {tenant.activeInquiries} Active
                                </p>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-medium ${
                              user.isVerified
                                ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                            }`}
                          >
                            {user.isVerified ? (
                              <>
                                <Check className="w-3 h-3" /> Verified
                              </>
                            ) : (
                              <>
                                <X className="w-3 h-3" /> Unverified
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-medium ${riskConfig.bgColor} ${riskConfig.color}`}>
                            {riskConfig.icon} {owner.fraudRiskLevel || tenant.fraudRiskLevel || 'Low'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div
                            className="flex items-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors">
                              <MessageCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </button>
                            {user.isActive ? (
                              <>
                                <button
                                  onClick={() => handleSuspend(user._id)}
                                  disabled={actionLoading[user._id]}
                                  className="p-1 hover:bg-amber-100 dark:hover:bg-amber-900 rounded transition-colors disabled:opacity-50 text-xs"
                                  title="Temporary suspension"
                                >
                                  ⏸️
                                </button>
                                <button
                                  onClick={() => handleBlock(user._id)}
                                  disabled={actionLoading[user._id]}
                                  className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors disabled:opacity-50"
                                  title="Permanent block"
                                >
                                  <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleUnblock(user._id)}
                                disabled={actionLoading[user._id]}
                                className="p-1 hover:bg-green-100 dark:hover:bg-green-900 rounded transition-colors disabled:opacity-50"
                              >
                                <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}{' '}
                users
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-medium text-zinc-900 dark:text-white">
                  Page {page} of {totalPages || 1}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || totalPages === 0}
                  className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
