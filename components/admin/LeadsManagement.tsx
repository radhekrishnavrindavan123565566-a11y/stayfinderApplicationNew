'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Phone,
  MessageSquare,
  Calendar,
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
} from 'lucide-react';
import axios from 'axios';
import type { InquiryRow, LeadFilter, LeadStatus } from '@/lib/admin/models';

interface LeadsManagementProps {
  onLeadSelect?: (lead: InquiryRow) => void;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const statusConfig: Record<LeadStatus, { color: string; bgColor: string; icon: React.ReactNode }> = {
  new_lead: {
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    icon: <Clock className="w-4 h-4" />,
  },
  call_done: {
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    icon: <Phone className="w-4 h-4" />,
  },
  visit_scheduled: {
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    icon: <Calendar className="w-4 h-4" />,
  },
  closed_booked: {
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  closed_not_interested: {
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    icon: <XCircle className="w-4 h-4" />,
  },
};

const priorityConfig: Record<string, { color: string; label: string }> = {
  low: { color: 'text-zinc-600 dark:text-zinc-400', label: 'Low' },
  medium: { color: 'text-amber-600 dark:text-amber-400', label: 'Medium' },
  high: { color: 'text-red-600 dark:text-red-400', label: 'High' },
};

export default function LeadsManagement({ onLeadSelect }: LeadsManagementProps) {
  const [leads, setLeads] = useState<InquiryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<LeadFilter>({
    status: undefined,
    priority: undefined,
    sortBy: 'newest',
  });
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [exporting, setExporting] = useState(false);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit,
        status: filters.status,
        priority: filters.priority,
        sortBy: filters.sortBy,
        search: searchQuery,
      };

      const response = await axios.get('/api/admin/inquiries', { params });
      setLeads(response.data.leads);
      setTotal(response.data.total);
    } catch (err) {
      setError('Failed to load leads');
      console.error('Leads fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [filters, searchQuery]);

  useEffect(() => {
    fetchLeads();
  }, [page, limit, filters, searchQuery]);

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    try {
      setActionLoading((prev) => ({ ...prev, [leadId]: true }));
      
      let reasonData = {};
      if (newStatus === 'closed_not_interested') {
        const reason = window.prompt(
          'Please provide reason for closure:\n\n' +
          '1. Price too high\n' +
          '2. Location mismatch\n' +
          '3. Property already taken\n' +
          '4. No response from tenant\n' +
          '5. Better option found\n' +
          '6. Other'
        );
        if (!reason) {
          setActionLoading((prev) => ({ ...prev, [leadId]: false }));
          return;
        }
        reasonData = { closureReason: reason };
      }

      await axios.patch(`/api/admin/inquiries/${leadId}/status`, {
        newStatus,
        ...reasonData,
      });
      fetchLeads();
    } catch (err) {
      console.error('Error updating lead status:', err);
      alert('Failed to update lead status');
    } finally {
      setActionLoading((prev) => ({ ...prev, [leadId]: false }));
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await axios.post('/api/admin/inquiries/export', {
        format: 'csv',
        filters,
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `leads-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentElement?.removeChild(link);
    } catch (err) {
      console.error('Error exporting leads:', err);
      alert('Failed to export leads');
    } finally {
      setExporting(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial="hidden" animate="show" variants={fadeUp} className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white">
            Leads & Inquiries
          </h1>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              disabled={exporting || leads.length === 0}
              className="flex items-center gap-2 bg-green-600 dark:bg-green-700 text-white rounded-lg px-4 py-2 hover:bg-green-700 dark:hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              {exporting ? 'Exporting...' : 'Export CSV'}
            </button>
            <button
              onClick={() => fetchLeads()}
              className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
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
              value={filters.status || ''}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  status: (e.target.value as LeadStatus) || undefined,
                }))
              }
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
              value={filters.priority || ''}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  priority: (e.target.value as any) || undefined,
                }))
              }
              className="w-full px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
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
              <option value="priority">Priority</option>
              <option value="status">Status</option>
              <option value="dueDate">Due Date</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Leads Table */}
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
        ) : leads.length === 0 ? (
          <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-12 text-center border border-zinc-200 dark:border-zinc-800">
            <p className="text-zinc-600 dark:text-zinc-400">No leads found</p>
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
                      Date & Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                      Priority
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {leads.map((lead) => {
                    const statusConfig_ = statusConfig[lead.status as LeadStatus];
                    const priorityConfig_ = priorityConfig[lead.priority];

                    return (
                      <tr
                        key={lead._id}
                        className="hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        onClick={() => onLeadSelect?.(lead)}
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-zinc-900 dark:text-white">
                              {lead.tenantName}
                            </p>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {lead.tenantPhone}
                            </p>
                            <p className="text-sm text-blue-600 dark:text-blue-400">
                              {lead.propertyTitle}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-zinc-900 dark:text-white">
                              {lead.ownerName}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                              {new Date(lead.inquiryDate).toLocaleDateString()}
                            </p>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-medium ${statusConfig_.bgColor} ${statusConfig_.color}`}
                            >
                              {statusConfig_.icon}
                              {lead.status.replace('_', ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <Flag className={`w-4 h-4 ${priorityConfig_.color}`} />
                            <span className={`text-sm font-medium ${priorityConfig_.color}`}>
                              {priorityConfig_.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div
                            className="flex items-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <select
                              value={lead.status}
                              onChange={(e) =>
                                handleStatusChange(lead._id, e.target.value as LeadStatus)
                              }
                              disabled={actionLoading[lead._id]}
                              className="text-xs px-2 py-1 border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white disabled:opacity-50"
                            >
                              <option value="new_lead">New Lead</option>
                              <option value="call_done">Call Done / Discussion</option>
                              <option value="visit_scheduled">Visit Scheduled</option>
                              <option value="visit_completed">Visit Completed</option>
                              <option value="closed_booked">Closed - Booked</option>
                              <option value="closed_not_interested">Closed - Not Interested</option>
                            </select>
                            <button className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors">
                              <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
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
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}{' '}
                leads
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
