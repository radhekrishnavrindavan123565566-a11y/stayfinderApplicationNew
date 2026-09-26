'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  MessageSquare,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Loader,
  AlertTriangle,
  Flag,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Calendar,
  Briefcase,
  User,
  Mail,
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Inquiry {
  _id: string;
  tenantId: {
    username: string;
    phone: string;
    email: string;
  };
  propertyId: {
    _id: string;
    title: string;
  };
  ownerId: {
    username: string;
    phone: string;
  };
  status: 'new_lead' | 'call_done' | 'visit_scheduled' | 'visit_completed' | 'closed_booked' | 'closed_not_interested';
  priority: 'low' | 'medium' | 'high';
  inquiryDate: string;
  lastUpdate: string;
  notes?: string;
  followUpDate?: string;
}

const statusConfig: Record<string, { color: string; bgColor: string; icon: React.ReactNode; label: string }> = {
  new_lead: {
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    icon: <Clock className="w-4 h-4" />,
    label: 'New Lead',
  },
  call_done: {
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    icon: <Phone className="w-4 h-4" />,
    label: 'Call Done',
  },
  visit_scheduled: {
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    icon: <Calendar className="w-4 h-4" />,
    label: 'Visit Scheduled',
  },
  visit_completed: {
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/30',
    icon: <Briefcase className="w-4 h-4" />,
    label: 'Visit Completed',
  },
  closed_booked: {
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    icon: <CheckCircle2 className="w-4 h-4" />,
    label: 'Closed - Booked',
  },
  closed_not_interested: {
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    icon: <XCircle className="w-4 h-4" />,
    label: 'Closed - Not Interested',
  },
};

const priorityConfig: Record<string, { color: string; label: string }> = {
  low: { color: 'text-zinc-600 dark:text-zinc-400', label: 'Low' },
  medium: { color: 'text-amber-600 dark:text-amber-400', label: 'Medium' },
  high: { color: 'text-red-600 dark:text-red-400', label: 'High' },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [exporting, setExporting] = useState(false);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page,
        limit,
      };

      if (searchQuery) params.search = searchQuery;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;

      const response = await axios.get('/api/admin/inquiries', { params });
      setInquiries(response.data.inquiries || []);
      setTotal(response.data.total || 0);
    } catch (err) {
      setError('Failed to load inquiries');
      console.error('Inquiries fetch error:', err);
      toast.error('Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter, priorityFilter]);

  useEffect(() => {
    fetchInquiries();
  }, [page, limit, searchQuery, statusFilter, priorityFilter]);

  const handleStatusChange = async (inquiryId: string, newStatus: string) => {
    try {
      setActionLoading((prev) => ({ ...prev, [inquiryId]: true }));

      await axios.patch(`/api/admin/inquiries/${inquiryId}/status`, {
        status: newStatus,
      });

      setInquiries((prev) =>
        prev.map((i) =>
          i._id === inquiryId ? { ...i, status: newStatus as any, lastUpdate: new Date().toISOString() } : i
        )
      );

      toast.success('Inquiry status updated');
    } catch (err) {
      console.error('Error updating inquiry status:', err);
      toast.error('Failed to update inquiry status');
    } finally {
      setActionLoading((prev) => ({ ...prev, [inquiryId]: false }));
    }
  };

  const handleExportCSV = async () => {
    try {
      setExporting(true);

      const response = await axios.get('/api/admin/inquiries/export/csv', {
        params: {
          status: statusFilter,
          priority: priorityFilter,
          search: searchQuery,
        },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `inquiries-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentElement?.removeChild(link);

      toast.success('Inquiries exported to CSV');
    } catch (err) {
      console.error('Error exporting inquiries:', err);
      toast.error('Failed to export inquiries');
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setExporting(true);

      const response = await axios.get('/api/admin/inquiries/export/excel', {
        params: {
          status: statusFilter,
          priority: priorityFilter,
          search: searchQuery,
        },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `inquiries-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentElement?.removeChild(link);

      toast.success('Inquiries exported to Excel');
    } catch (err) {
      console.error('Error exporting inquiries:', err);
      toast.error('Failed to export inquiries');
    } finally {
      setExporting(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial="hidden" animate="show" variants={fadeUp} className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black text-zinc-900 dark:text-white">
              Leads & Inquiries
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">
              Manage and track all property inquiries
            </p>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={handleExportExcel}
              disabled={exporting || inquiries.length === 0}
              className="flex items-center gap-2 bg-green-600 dark:bg-green-700 text-white rounded-lg px-4 py-2 hover:bg-green-700 dark:hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              {exporting ? 'Exporting...' : 'Excel'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={handleExportCSV}
              disabled={exporting || inquiries.length === 0}
              className="flex items-center gap-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg px-4 py-2 hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              CSV
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => fetchInquiries()}
              className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </motion.button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by tenant name, phone, property..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="new_lead">New Lead</option>
              <option value="call_done">Call Done</option>
              <option value="visit_scheduled">Visit Scheduled</option>
              <option value="visit_completed">Visit Completed</option>
              <option value="closed_booked">Closed - Booked</option>
              <option value="closed_not_interested">Closed - Not Interested</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Priority
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Items per page
            </label>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="w-full px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Inquiries Table */}
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
        ) : inquiries.length === 0 ? (
          <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-12 text-center border border-zinc-200 dark:border-zinc-800">
            <MessageSquare className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-600 dark:text-zinc-400">No inquiries found</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                      Tenant & Property
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                      Owner
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                      Inquiry Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                      Priority
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                      Update Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {inquiries.map((inquiry) => {
                    const statusInfo = statusConfig[inquiry.status];
                    const priorityInfo = priorityConfig[inquiry.priority];

                    return (
                      <motion.tr
                        key={inquiry._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-zinc-400" />
                              <p className="font-semibold text-zinc-900 dark:text-white">
                                {inquiry.tenantId?.username || 'N/A'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                              <Phone className="w-3 h-3" />
                              {inquiry.tenantId?.phone || 'N/A'}
                            </div>
                            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                              {inquiry.propertyId?.title || 'Property not found'}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-zinc-900 dark:text-white">
                              {inquiry.ownerId?.username || 'N/A'}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                              <Phone className="w-3 h-3" />
                              {inquiry.ownerId?.phone || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <p className="font-medium text-zinc-900 dark:text-white">
                              {new Date(inquiry.inquiryDate).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              {new Date(inquiry.inquiryDate).toLocaleTimeString()}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bgColor} ${statusInfo.color}`}
                          >
                            {statusInfo.icon}
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <Flag className={`w-4 h-4 ${priorityInfo.color}`} />
                            <span className={`text-sm font-medium ${priorityInfo.color}`}>
                              {priorityInfo.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={inquiry.status}
                              onChange={(e) => handleStatusChange(inquiry._id, e.target.value)}
                              disabled={actionLoading[inquiry._id]}
                              className="text-xs px-3 py-1 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="new_lead">New Lead</option>
                              <option value="call_done">Call Done</option>
                              <option value="visit_scheduled">Visit Scheduled</option>
                              <option value="visit_completed">Visit Completed</option>
                              <option value="closed_booked">Closed - Booked</option>
                              <option value="closed_not_interested">Closed - Not</option>
                            </select>
                            {actionLoading[inquiry._id] && (
                              <Loader className="w-3 h-3 animate-spin text-blue-500" />
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} inquiries
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
