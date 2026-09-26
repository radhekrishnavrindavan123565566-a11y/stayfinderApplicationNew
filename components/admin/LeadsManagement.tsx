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
  Users,
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useApi } from '@/hooks/useApi';
import { format } from 'date-fns';

interface Inquiry {
  _id: string;
  tenantId: string;
  tenantName: string;
  tenantPhone: string;
  propertyId: string;
  propertyTitle: string;
  ownerId: string;
  ownerName: string;
  inquiryDate: string;
  inquiryTime?: string;
  status: 'new_lead' | 'call_done' | 'visit_scheduled' | 'closed_booked' | 'closed_not_interested';
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  followUpDate?: string;
  notes?: string;
  lastContactDate?: string;
  contactAttempts?: number;
  conversionValue?: number;
}

interface LeadsManagementProps {
  onLeadSelect?: (lead: Inquiry) => void;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const statusConfig = {
  new_lead: {
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    icon: <Clock className="w-4 h-4" />,
    label: 'New Lead',
    order: 1,
  },
  call_done: {
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    icon: <Phone className="w-4 h-4" />,
    label: 'Call Done / Discussion',
    order: 2,
  },
  visit_scheduled: {
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    icon: <Calendar className="w-4 h-4" />,
    label: 'Visit Scheduled',
    order: 3,
  },
  closed_booked: {
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    icon: <CheckCircle2 className="w-4 h-4" />,
    label: 'Closed / Booked',
    order: 4,
  },
  closed_not_interested: {
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    icon: <XCircle className="w-4 h-4" />,
    label: 'Closed / Not Interested',
    order: 5,
  },
};

const priorityConfig = {
  low: { color: 'text-zinc-600 dark:text-zinc-400', label: 'Low', bg: 'bg-zinc-100 dark:bg-zinc-800' },
  medium: { color: 'text-amber-600 dark:text-amber-400', label: 'Medium', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  high: { color: 'text-red-600 dark:text-red-400', label: 'High', bg: 'bg-red-100 dark:bg-red-900/30' },
};

export default function LeadsManagement({ onLeadSelect }: LeadsManagementProps) {
  const [leads, setLeads] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [exporting, setExporting] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Inquiry | null>(null);
  const [notesText, setNotesText] = useState('');
  const { authHeaders } = useApi();

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        sortBy,
        search: searchQuery,
      };

      const response = await axios.get('/api/admin/inquiries', { params, ...authHeaders() });
      
      // Transform API response to match component expectations
      const transformedLeads = (response.data.inquiries || []).map((inquiry: any) => ({
        _id: inquiry._id,
        tenantId: inquiry.tenantId?._id || inquiry.tenantId,
        tenantName: inquiry.tenantId?.username || inquiry.tenantName,
        tenantPhone: inquiry.tenantId?.phone || inquiry.tenantPhone,
        propertyId: inquiry.propertyId?._id || inquiry.propertyId,
        propertyTitle: inquiry.propertyId?.title || inquiry.propertyTitle,
        ownerId: inquiry.ownerId?._id || inquiry.ownerId,
        ownerName: inquiry.ownerId?.username || inquiry.ownerName,
        inquiryDate: inquiry.inquiryDate,
        inquiryTime: inquiry.inquiryTime,
        status: inquiry.status,
        priority: inquiry.priority,
        tags: inquiry.tags,
        followUpDate: inquiry.followUpDate,
        notes: inquiry.notes,
        lastContactDate: inquiry.lastContactDate,
        contactAttempts: inquiry.contactAttempts,
        conversionValue: inquiry.conversionValue,
      }));
      
      setLeads(transformedLeads);
      setTotal(response.data.total || 0);
    } catch (err) {
      setError('Failed to load leads');
      console.error('Leads fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [statusFilter, searchQuery, sortBy, priorityFilter]);

  useEffect(() => {
    fetchLeads();
  }, [page, limit, statusFilter, searchQuery, sortBy, priorityFilter]);

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    setActionLoading((prev) => ({ ...prev, [leadId]: true }));
    try {
      await axios.patch(
        `/api/admin/inquiries/${leadId}`,
        { status: newStatus },
        authHeaders()
      );
      setLeads((prev) =>
        prev.map((l) =>
          l._id === leadId ? { ...l, status: newStatus as Inquiry['status'] } : l
        )
      );
      toast.success(`Lead status updated to ${statusConfig[newStatus as keyof typeof statusConfig]?.label}`);
    } catch (err) {
      toast.error('Failed to update lead status');
      console.error('Status update error:', err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [leadId]: false }));
    }
  };

  const handlePriorityChange = async (leadId: string, newPriority: string) => {
    setActionLoading((prev) => ({ ...prev, [`${leadId}-priority`]: true }));
    try {
      await axios.patch(
        `/api/admin/inquiries/${leadId}`,
        { priority: newPriority },
        authHeaders()
      );
      setLeads((prev) =>
        prev.map((l) =>
          l._id === leadId ? { ...l, priority: newPriority as Inquiry['priority'] } : l
        )
      );
      if (selectedLead?._id === leadId) {
        setSelectedLead((prev) =>
          prev ? { ...prev, priority: newPriority as Inquiry['priority'] } : null
        );
      }
      toast.success('Priority updated');
    } catch (err) {
      toast.error('Failed to update priority');
    } finally {
      setActionLoading((prev) => ({ ...prev, [`${leadId}-priority`]: false }));
    }
  };

  const handleSaveNotes = async (leadId: string) => {
    setActionLoading((prev) => ({ ...prev, [`notes-${leadId}`]: true }));
    try {
      await axios.patch(
        `/api/admin/inquiries/${leadId}`,
        { notes: notesText },
        authHeaders()
      );
      setLeads((prev) =>
        prev.map((l) =>
          l._id === leadId ? { ...l, notes: notesText } : l
        )
      );
      if (selectedLead?._id === leadId) {
        setSelectedLead((prev) => (prev ? { ...prev, notes: notesText } : null));
      }
      toast.success('Notes saved');
    } catch (err) {
      toast.error('Failed to save notes');
    } finally {
      setActionLoading((prev) => ({ ...prev, [`notes-${leadId}`]: false }));
    }
  };

  const downloadLeadsCSV = () => {
    if (leads.length === 0) {
      toast.error('No leads to download');
      return;
    }

    const headers = [
      'Tenant Name',
      'Phone',
      'Property',
      'Owner',
      'Inquiry Date',
      'Status',
      'Priority',
      'Follow Up',
    ];

    const rows = leads.map((l) => [
      l.tenantName || '',
      l.tenantPhone || '',
      l.propertyTitle || '',
      l.ownerName || '',
      l.inquiryDate ? format(new Date(l.inquiryDate), 'MMM d, yyyy') : '',
      statusConfig[l.status as keyof typeof statusConfig]?.label || l.status,
      priorityConfig[l.priority as keyof typeof priorityConfig]?.label || 'N/A',
      l.followUpDate ? format(new Date(l.followUpDate), 'MMM d, yyyy') : '',
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
      `leads_${format(new Date(), 'yyyy-MM-dd_HHmmss')}.csv`
    );
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success(`Downloaded ${leads.length} leads as CSV`);
  };

  const downloadLeadsExcel = () => {
    if (leads.length === 0) {
      toast.error('No leads to download');
      return;
    }

    const data = leads.map((l) => ({
      'Tenant Name': l.tenantName || '',
      'Phone': l.tenantPhone || '',
      'Property': l.propertyTitle || '',
      'Owner': l.ownerName || '',
      'Inquiry Date': l.inquiryDate ? format(new Date(l.inquiryDate), 'MMM d, yyyy') : '',
      'Status': statusConfig[l.status as keyof typeof statusConfig]?.label || l.status,
      'Priority': priorityConfig[l.priority as keyof typeof priorityConfig]?.label || 'N/A',
      'Follow Up': l.followUpDate ? format(new Date(l.followUpDate), 'MMM d, yyyy') : '',
      'Notes': l.notes || '',
    }));

    const jsonContent = JSON.stringify(data, null, 2);

    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:application/json;charset=utf-8,' + encodeURIComponent(jsonContent)
    );
    element.setAttribute(
      'download',
      `leads_${format(new Date(), 'yyyy-MM-dd_HHmmss')}.json`
    );
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success(`Downloaded ${leads.length} leads as JSON`);
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
            Leads & Inquiries
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Track and manage all tenant inquiries and lead conversions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={downloadLeadsCSV}
            disabled={exporting}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={downloadLeadsExcel}
            disabled={exporting}
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            JSON
          </button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800"
      >
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search tenant, property..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="all">All Status</option>
            <option value="new_lead">New Leads</option>
            <option value="call_done">Call Done</option>
            <option value="visit_scheduled">Visit Scheduled</option>
            <option value="closed_booked">Booked</option>
            <option value="closed_not_interested">Not Interested</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="all">All Priority</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
            className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>

          {/* Refresh */}
          <button
            onClick={fetchLeads}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </motion.div>

      {/* Leads Pipeline Overview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800"
      >
        <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">Pipeline Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(statusConfig).map(([key, config]) => {
            const count = leads.filter((l) => l.status === key).length;
            return (
              <motion.div
                key={key}
                whileHover={{ scale: 1.05 }}
                onClick={() => setStatusFilter(statusFilter === key ? 'all' : key)}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  statusFilter === key
                    ? config.bgColor
                    : 'bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {config.icon}
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    {config.label}
                  </span>
                </div>
                <p className={`text-2xl font-bold ${config.color}`}>{count}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Leads Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-rose-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-zinc-600 dark:text-zinc-400">{error}</p>
              <button
                onClick={fetchLeads}
                className="mt-4 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600"
              >
                Retry
              </button>
            </div>
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-600 dark:text-zinc-400">No leads found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Tenant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Property
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {(leads || []).map((lead) => (
                    <motion.tr
                      key={lead?._id}
                      variants={fadeUp}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-zinc-900 dark:text-white">
                            {lead?.tenantName || 'N/A'}
                          </p>
                          <a
                            href={`tel:${lead?.tenantPhone || ''}`}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" />
                            {lead?.tenantPhone || 'N/A'}
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-zinc-900 dark:text-white text-sm">
                            {lead?.propertyTitle || 'N/A'}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Property ID: {lead?.propertyId || 'N/A'}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-zinc-900 dark:text-white text-sm">
                          {lead?.ownerName || 'N/A'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={lead?.status || 'new_lead'}
                          onChange={(e) => handleStatusChange(lead?._id || '', e.target.value)}
                          disabled={actionLoading[lead?._id || '']}
                          className={`px-3 py-1 rounded-lg text-xs font-medium border-0 cursor-pointer disabled:opacity-50 ${
                            statusConfig[(lead?.status || 'new_lead') as keyof typeof statusConfig]?.bgColor
                          } ${statusConfig[(lead?.status || 'new_lead') as keyof typeof statusConfig]?.color}`}
                        >
                          <option value="new_lead">New Lead</option>
                          <option value="call_done">Call Done</option>
                          <option value="visit_scheduled">Visit Scheduled</option>
                          <option value="closed_booked">Booked</option>
                          <option value="closed_not_interested">Not Interested</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={lead?.priority || 'medium'}
                          onChange={(e) => handlePriorityChange(lead?._id || '', e.target.value)}
                          disabled={actionLoading[`${lead?._id || ''}-priority`]}
                          className={`px-3 py-1 rounded-lg text-xs font-medium border-0 cursor-pointer disabled:opacity-50 ${
                            priorityConfig[(lead?.priority || 'medium') as keyof typeof priorityConfig]?.bg
                          } ${priorityConfig[(lead?.priority || 'medium') as keyof typeof priorityConfig]?.color}`}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-zinc-600 dark:text-zinc-400">
                          <p>{lead.inquiryDate ? format(new Date(lead.inquiryDate), 'MMM d, yyyy') : 'N/A'}</p>
                          {lead.followUpDate && (
                            <p className="text-xs text-amber-600 dark:text-amber-400">
                              Follow up: {format(new Date(lead.followUpDate), 'MMM d')}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedLead(lead);
                            setNotesText(lead.notes || '');
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                          title="View details"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
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
                  Page {page} of {totalPages} • {total} total leads
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

      {/* Lead Details Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-zinc-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {selectedLead?.tenantName || 'Lead'}
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  Interested in: {selectedLead?.propertyTitle || 'N/A'}
                </p>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-zinc-600 dark:text-zinc-400" />
              </button>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tenant Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-zinc-900 dark:text-white">Tenant Details</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase font-medium">Name</p>
                    <p className="text-sm text-zinc-900 dark:text-white mt-1">{selectedLead.tenantName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase font-medium">Phone</p>
                    <a
                      href={`tel:${selectedLead.tenantPhone}`}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-1"
                    >
                      {selectedLead.tenantPhone}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase font-medium">Inquiry Date</p>
                    <p className="text-sm text-zinc-900 dark:text-white mt-1">
                      {selectedLead.inquiryDate
                        ? format(new Date(selectedLead.inquiryDate), 'MMM d, yyyy • h:mm a')
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Property & Status */}
              <div className="space-y-4">
                <h3 className="font-semibold text-zinc-900 dark:text-white">Lead Status</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase font-medium mb-2">Status</p>
                    <select
                      value={selectedLead?.status || 'new_lead'}
                      onChange={(e) => handleStatusChange(selectedLead?._id || '', e.target.value)}
                      disabled={actionLoading[selectedLead?._id || '']}
                      className={`w-full px-3 py-2 rounded-lg text-sm font-medium border-0 cursor-pointer disabled:opacity-50 ${
                        statusConfig[(selectedLead?.status || 'new_lead') as keyof typeof statusConfig]?.bgColor
                      } ${statusConfig[(selectedLead?.status || 'new_lead') as keyof typeof statusConfig]?.color}`}
                    >
                      <option value="new_lead">New Lead</option>
                      <option value="call_done">Call Done / Discussion</option>
                      <option value="visit_scheduled">Visit Scheduled</option>
                      <option value="closed_booked">Closed / Booked</option>
                      <option value="closed_not_interested">Closed / Not Interested</option>
                    </select>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase font-medium mb-2">Priority</p>
                    <select
                      value={selectedLead?.priority || 'medium'}
                      onChange={(e) => handlePriorityChange(selectedLead?._id || '', e.target.value)}
                      disabled={actionLoading[`${selectedLead?._id || ''}-priority`]}
                      className={`w-full px-3 py-2 rounded-lg text-sm font-medium border-0 cursor-pointer disabled:opacity-50 ${
                        priorityConfig[(selectedLead?.priority || 'medium') as keyof typeof priorityConfig]?.bg
                      } ${priorityConfig[(selectedLead?.priority || 'medium') as keyof typeof priorityConfig]?.color}`}
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Owner & Property Info */}
            <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-3">Property Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase font-medium">Property</p>
                  <p className="text-sm text-zinc-900 dark:text-white mt-1">{selectedLead.propertyTitle}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">ID: {selectedLead.propertyId}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase font-medium">Owner</p>
                  <p className="text-sm text-zinc-900 dark:text-white mt-1">{selectedLead.ownerName}</p>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-3">Contact Tracking</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded-lg">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase font-medium">Last Contact</p>
                  <p className="text-lg font-semibold text-zinc-900 dark:text-white mt-1">
                    {selectedLead.lastContactDate
                      ? format(new Date(selectedLead.lastContactDate), 'MMM d')
                      : 'Never'}
                  </p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded-lg">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase font-medium">Attempts</p>
                  <p className="text-lg font-semibold text-zinc-900 dark:text-white mt-1">
                    {selectedLead.contactAttempts || 0}
                  </p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded-lg">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase font-medium">Value</p>
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400 mt-1">
                    ₹{(selectedLead.conversionValue || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-3">Internal Notes</h3>
              <textarea
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                placeholder="Add notes about this lead..."
                className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                rows={4}
              />
              <button
                onClick={() => handleSaveNotes(selectedLead?._id || '')}
                disabled={actionLoading[`notes-${selectedLead?._id || ''}`]}
                className="mt-2 w-full px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50"
              >
                {actionLoading[`notes-${selectedLead?._id || ''}`] ? (
                  <Loader className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  'Save Notes'
                )}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
              <button
                onClick={() => window.location.href = `tel:${selectedLead.tenantPhone}`}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Phone className="w-4 h-4" />
                Call Tenant
              </button>
              <button
                onClick={() => window.location.href = `sms:${selectedLead.tenantPhone}`}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Send SMS
              </button>
              <button
                onClick={() => setSelectedLead(null)}
                className="ml-auto px-4 py-2 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
