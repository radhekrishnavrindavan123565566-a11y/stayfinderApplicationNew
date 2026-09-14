'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Loader,
} from 'lucide-react';
import axios from 'axios';
import type { PropertyListingRow, PropertyFilter } from '@/lib/admin/models';

interface PropertyListingsProps {
  onPropertySelect?: (property: PropertyListingRow) => void;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const statusConfig: Record<string, { color: string; bgColor: string; icon: string }> = {
  pending: {
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    icon: '⏳',
  },
  active: {
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    icon: '✓',
  },
  booked: {
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    icon: '📅',
  },
  hidden: {
    color: 'text-zinc-600 dark:text-zinc-400',
    bgColor: 'bg-zinc-50 dark:bg-zinc-950/30',
    icon: '👁️‍🗨️',
  },
  archived: {
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    icon: '🗂️',
  },
};

export default function PropertyListings({ onPropertySelect }: PropertyListingsProps) {
  const [properties, setProperties] = useState<PropertyListingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<PropertyFilter>({
    status: undefined,
    city: undefined,
    sortBy: 'newest',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const handleReject = async (propertyId: string) => {
    const reason = window.prompt('Please provide a reason for rejection:\n\n1. Poor quality images\n2. Incomplete information\n3. Price mismatch\n4. Location not matching\n5. Other (please specify)');
    if (!reason) return;

    try {
      setActionLoading((prev) => ({ ...prev, [propertyId]: true }));
      await axios.patch(`/api/admin/properties/${propertyId}/status`, {
        status: 'rejected',
        rejectionReason: reason,
      });
      fetchProperties();
      alert('Property rejected and owner notified');
    } catch (err) {
      console.error('Error rejecting property:', err);
      alert('Failed to reject property');
    } finally {
      setActionLoading((prev) => ({ ...prev, [propertyId]: false }));
    }
  };

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit,
        status: filters.status,
        city: filters.city,
        sortBy: filters.sortBy,
        search: searchQuery,
      };

      const response = await axios.get('/api/admin/properties', { params });
      setProperties(response.data.properties);
      setTotal(response.data.total);
    } catch (err) {
      setError('Failed to load properties');
      console.error('Properties fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [filters, searchQuery]);

  useEffect(() => {
    fetchProperties();
  }, [page, limit, filters, searchQuery]);

  const handleStatusChange = async (propertyId: string, newStatus: string) => {
    try {
      setActionLoading((prev) => ({ ...prev, [propertyId]: true }));
      await axios.patch(`/api/admin/properties/${propertyId}/status`, {
        status: newStatus,
      });
      fetchProperties();
    } catch (err) {
      console.error('Error updating property status:', err);
      alert('Failed to update property status');
    } finally {
      setActionLoading((prev) => ({ ...prev, [propertyId]: false }));
    }
  };

  const handleDelete = async (propertyId: string) => {
    if (!window.confirm('Are you sure you want to delete this property?')) {
      return;
    }
    try {
      setActionLoading((prev) => ({ ...prev, [propertyId]: true }));
      await axios.delete(`/api/admin/properties/${propertyId}`);
      fetchProperties();
    } catch (err) {
      console.error('Error deleting property:', err);
      alert('Failed to delete property');
    } finally {
      setActionLoading((prev) => ({ ...prev, [propertyId]: false }));
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <motion.div initial="hidden" animate="show" variants={fadeUp} className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white">
            Property Listings
          </h1>
          <button
            onClick={() => fetchProperties()}
            className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search properties by title, address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Status
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  status: (e.target.value as any) || undefined,
                }))
              }
              className="w-full px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending Approval</option>
              <option value="active">Active</option>
              <option value="booked">Booked/Occupied</option>
              <option value="hidden">Hidden</option>
              <option value="under_review">Under Review</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Price Range
            </label>
            <input
              type="text"
              placeholder="e.g., 5000-15000"
              className="w-full px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Date Range
            </label>
            <input
              type="date"
              className="w-full px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Sort By
            </label>
            <select
              value={filters.sortBy || 'newest'}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  sortBy: e.target.value as any,
                }))
              }
              className="w-full px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="views">Most Views</option>
              <option value="price">Price</option>
              <option value="rating">Rating</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Properties Table */}
      <motion.div initial="hidden" animate="show" variants={fadeUp}>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-6 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-12 text-center border border-zinc-200 dark:border-zinc-800">
            <p className="text-zinc-600 dark:text-zinc-400">No properties found</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                      Property
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                      Owner
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {properties.map((property) => {
                    const status = statusConfig[property.status];
                    return (
                      <tr
                        key={property._id}
                        className="hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        onClick={() => onPropertySelect?.(property)}
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-zinc-900 dark:text-white">
                              {property.title}
                            </p>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                              {property.bedrooms}BHK • {property.bathrooms} Bath
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-zinc-900 dark:text-white">
                              {property.ownerName}
                            </p>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                              {property.isVerified ? '✓ Verified' : 'Unverified'}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-zinc-900 dark:text-white">
                              {property.location.address}
                            </p>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                              {property.location.city}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-zinc-900 dark:text-white">
                            ₹{property.price.toLocaleString()}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${status.bgColor} ${status.color}`}
                          >
                            {status.icon} {property.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div
                            className="flex items-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <select
                              value={property.status}
                              onChange={(e) => {
                                if (e.target.value === 'rejected') {
                                  handleReject(property._id);
                                } else {
                                  handleStatusChange(property._id, e.target.value);
                                }
                              }}
                              disabled={actionLoading[property._id]}
                              className="text-xs px-2 py-1 border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white disabled:opacity-50"
                            >
                              <option value="pending">Pending</option>
                              <option value="active">Active (Approve)</option>
                              <option value="booked">Booked</option>
                              <option value="under_review">Under Review</option>
                              <option value="hidden">Hidden</option>
                              <option value="rejected">Reject</option>
                            </select>
                            <button className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors">
                              <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </button>
                            <button
                              onClick={() => handleDelete(property._id)}
                              disabled={actionLoading[property._id]}
                              className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                            </button>
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
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of{' '}
                {total} properties
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
