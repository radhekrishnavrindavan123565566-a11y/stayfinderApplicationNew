'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Clock,
  CheckCircle2,
  XCircle,
  X,
  Mail,
  User,
  Home,
  TrendingUp,
  ExternalLink,
  Flag,
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useApi } from '@/hooks/useApi';
import { format, formatDistanceToNow } from 'date-fns';

interface Inquiry {
  _id: string;
  tenantId: string;
  tenantName: string;
  tenantPhone: string;
  tenantEmail?: string;
  propertyId: string;
  propertyTitle: string;
  propertyCity?: string;
  propertyRent?: number;
  ownerId: string;
  ownerName: string;
  ownerPhone?: string;
  inquiryDate: string;
  status: 'new_lead' | 'call_done' | 'visit_scheduled' | 'visit_completed' | 'closed_booked' | 'closed_not_interested';
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  followUpDate?: string;
  notes?: string;
  source?: string;
}

const STATUS_CONFIG = {
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
    label: 'Call Done',
    order: 2,
  },
  visit_scheduled: {
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    icon: <Calendar className="w-4 h-4" />,
    label: 'Visit Scheduled',
    order: 3,
  },
  visit_completed: {
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/30',
    icon: <CheckCircle2 className="w-4 h-4" />,
    label: 'Visit Done',
    order: 4,
  },
  closed_booked: {
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    icon: <CheckCircle2 className="w-4 h-4" />,
    label: 'Booked ✓',
    order: 5,
  },
  closed_not_interested: {
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    icon: <XCircle className="w-4 h-4" />,
    label: 'Not Interested',
    order: 6,
  },
} as const;

const PRIORITY_CONFIG = {
  low: { color: 'text-zinc-600 dark:text-zinc-400', label: 'Low', bg: 'bg-zinc-100 dark:bg-zinc-800' },
  medium: { color: 'text-amber-600 dark:text-amber-400', label: 'Medium', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  high: { color: 'text-red-600 dark:text-red-400', label: '🔥 High', bg: 'bg-red-100 dark:bg-red-900/30' },
} as const;

// Visual pipeline steps
const PIPELINE_STEPS = [
  'new_lead',
  'call_done',
  'visit_scheduled',
  'visit_completed',
  'closed_booked',
] as const;

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

export default function LeadsManagement() {
  const [leads, setLeads] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [selectedLead, setSelectedLead] = useState<Inquiry | null>(null);
  const [notesText, setNotesText] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const { authHeaders } = useApi();

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: Record<string, string | undefined> = {
        page: page.toString(),
        limit: limit.toString(),
        status: statusFilter !== 'all' ? statusFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        search: searchQuery || undefined,
      };
      // Remove undefined keys
      Object.keys(params).forEach((k) => params[k] === undefined && delete params[k]);

      const res = await axios.get('/api/admin/inquiries', { params, ...authHeaders() });
      const raw = res.data.inquiries || [];

      const transformed: Inquiry[] = raw.map((q: any) => ({
        _id: q._id,
        tenantId: q.tenantId?._id || q.tenantId,
        tenantName: q.tenantId?.username || 'N/A',
        tenantPhone: q.tenantId?.phone || 'N/A',
        tenantEmail: q.tenantId?.email || '',
        propertyId: q.propertyId?._id || q.propertyId,
        propertyTitle: q.propertyId?.title || 'N/A',
        propertyCity: q.propertyId?.location?.city || '',
        propertyRent: q.propertyId?.price || 0,
        ownerId: q.ownerId?._id || q.ownerId,
        ownerName: q.ownerId?.username || 'N/A',
        ownerPhone: q.ownerId?.phone || '',
        inquiryDate: q.inquiryDate,
        status: q.status || 'new_lead',
        priority: q.priority || 'medium',
        tags: q.tags || [],
        followUpDate: q.followUpDate,
        notes: q.notes || '',
        source: q.source || 'app',
      }));

      setLeads(transformed);
      setTotal(res.data.total || 0);
    } catch {
      setError('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setPage(1); }, [statusFilter, searchQuery, sortBy, priorityFilter]);
  useEffect(() => { fetchLeads(); }, [page, statusFilter, searchQuery, sortBy, priorityFilter]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const update = async (id: string, payload: Record<string, unknown>, loadKey = id) => {
    setActionLoading((p) => ({ ...p, [loadKey]: true }));
    try {
      await axios.patch(`/api/admin/inquiries/${id}`, payload, authHeaders());
      setLeads((prev) => prev.map((l) => l._id === id ? { ...l, ...payload } : l));
      if (selectedLead?._id === id) setSelectedLead((p) => p ? { ...p, ...(payload as Partial<Inquiry>) } : null);
      toast.success('Updated successfully');
    } catch {
      toast.error('Update failed');
    } finally {
      setActionLoading((p) => ({ ...p, [loadKey]: false }));
    }
  };

  const handleSaveNotes = () => {
    if (!selectedLead) return;
    update(selectedLead._id, { notes: notesText, followUpDate: followUpDate || undefined }, `notes-${selectedLead._id}`);
  };

  const downloadCSV = () => {
    if (!leads.length) { toast.error('No leads to download'); return; }
    const header = 'Tenant,Phone,Email,Property,City,Rent,Owner,Status,Priority,Inquiry Date,Follow Up\n';
    const rows = leads.map((l) => [
      l.tenantName, l.tenantPhone, l.tenantEmail, l.propertyTitle,
      l.propertyCity, l.propertyRent, l.ownerName,
      STATUS_CONFIG[l.status]?.label || l.status,
      PRIORITY_CONFIG[l.priority || 'medium']?.label,
      l.inquiryDate ? format(new Date(l.inquiryDate), 'yyyy-MM-dd') : '',
      l.followUpDate ? format(new Date(l.followUpDate), 'yyyy-MM-dd') : '',
    ].map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');

    const el = document.createElement('a');
    el.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(header + rows);
    el.download = `leads_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`;
    el.click();
    toast.success('Downloaded CSV');
  };

  const totalPages = Math.ceil(total / limit);

  const pipelineCount = (s: string) => leads.filter((l) => l.status === s).length;

  return (
    <motion.div initial="hidden" animate="show" variants={fadeUp} className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white">Leads & Inquiries</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            Track, convert, and follow up on all tenant inquiries
          </p>
        </div>
        <button
          onClick={downloadCSV}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* ── Pipeline Visual ─────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-rose-500" /> Conversion Pipeline
        </h3>
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {PIPELINE_STEPS.map((step, i) => {
            const cfg = STATUS_CONFIG[step];
            const count = pipelineCount(step);
            const isActive = statusFilter === step;
            return (
              <div key={step} className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => setStatusFilter(isActive ? 'all' : step)}
                  className={`flex flex-col items-center px-4 py-3 rounded-xl cursor-pointer transition-all min-w-[100px] ${
                    isActive ? cfg.bgColor : 'bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <div className={`${cfg.color} mb-1`}>{cfg.icon}</div>
                  <span className={`text-xl font-black ${cfg.color}`}>{count}</span>
                  <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 text-center leading-tight mt-0.5">
                    {cfg.label}
                  </span>
                </button>
                {i < PIPELINE_STEPS.length - 1 && (
                  <div className="text-zinc-300 dark:text-zinc-600 font-bold text-lg">›</div>
                )}
              </div>
            );
          })}
          {/* Not interested counter (outside pipeline) */}
          <div className="flex items-center gap-1 flex-shrink-0 ml-3 pl-3 border-l border-zinc-200 dark:border-zinc-700">
            <button
              onClick={() => setStatusFilter(statusFilter === 'closed_not_interested' ? 'all' : 'closed_not_interested')}
              className={`flex flex-col items-center px-4 py-3 rounded-xl cursor-pointer transition-all min-w-[100px] ${
                statusFilter === 'closed_not_interested'
                  ? STATUS_CONFIG.closed_not_interested.bgColor
                  : 'bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <div className="text-red-500 mb-1"><XCircle className="w-4 h-4" /></div>
              <span className="text-xl font-black text-red-500">{pipelineCount('closed_not_interested')}</span>
              <span className="text-[10px] font-medium text-zinc-500 text-center leading-tight mt-0.5">Not Interested</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Filters ────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search tenant, phone, property…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="all">All Priorities</option>
            <option value="high">🔥 High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
            <button
              onClick={fetchLeads}
              disabled={loading}
              className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader className="w-8 h-8 text-rose-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">{error}</p>
            <button onClick={fetchLeads} className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600">Retry</button>
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-500 dark:text-zinc-400">No leads found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                    <th className="px-5 py-3 text-left">Tenant</th>
                    <th className="px-5 py-3 text-left">Property</th>
                    <th className="px-5 py-3 text-left">Owner</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-left">Priority</th>
                    <th className="px-5 py-3 text-left">Date</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {leads.map((lead) => (
                    <tr key={lead._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-zinc-900 dark:text-white text-sm">{lead.tenantName}</p>
                        <a href={`tel:${lead.tenantPhone}`} className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                          <Phone className="w-3 h-3" />{lead.tenantPhone}
                        </a>
                        {lead.tenantEmail && (
                          <a href={`mailto:${lead.tenantEmail}`} className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                            {lead.tenantEmail}
                          </a>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-zinc-900 dark:text-white">{lead.propertyTitle}</p>
                        {lead.propertyCity && (
                          <p className="text-xs text-zinc-400">{lead.propertyCity}</p>
                        )}
                        {lead.propertyRent ? (
                          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            ₹{lead.propertyRent.toLocaleString('en-IN')}/mo
                          </p>
                        ) : null}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-zinc-900 dark:text-white">{lead.ownerName}</p>
                        {lead.ownerPhone && (
                          <a href={`tel:${lead.ownerPhone}`} className="text-xs text-zinc-400 hover:underline">
                            {lead.ownerPhone}
                          </a>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={lead.status}
                          onChange={(e) => update(lead._id, { status: e.target.value })}
                          disabled={actionLoading[lead._id]}
                          className={`px-2 py-1 rounded-lg text-xs font-medium border-0 cursor-pointer disabled:opacity-50 ${STATUS_CONFIG[lead.status]?.bgColor} ${STATUS_CONFIG[lead.status]?.color}`}
                        >
                          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={lead.priority || 'medium'}
                          onChange={(e) => update(lead._id, { priority: e.target.value }, `${lead._id}-priority`)}
                          disabled={actionLoading[`${lead._id}-priority`]}
                          className={`px-2 py-1 rounded-lg text-xs font-medium border-0 cursor-pointer disabled:opacity-50 ${PRIORITY_CONFIG[lead.priority || 'medium']?.bg} ${PRIORITY_CONFIG[lead.priority || 'medium']?.color}`}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </td>
                      <td className="px-5 py-4 text-xs text-zinc-500 dark:text-zinc-400">
                        <p>{lead.inquiryDate ? format(new Date(lead.inquiryDate), 'dd MMM yy') : '—'}</p>
                        {lead.followUpDate && (
                          <p className="text-amber-600 dark:text-amber-400 font-medium">
                            Follow up: {format(new Date(lead.followUpDate), 'dd MMM')}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => { setSelectedLead(lead); setNotesText(lead.notes || ''); setFollowUpDate(lead.followUpDate ? lead.followUpDate.split('T')[0] : ''); }}
                          className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                          title="View & manage lead"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  Page {page} of {totalPages} · {total} leads
                </span>
                <div className="flex gap-2">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Lead Detail Modal ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedLead && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-2xl shadow-2xl my-4"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{selectedLead.tenantName}</h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Interested in: <span className="font-medium text-zinc-700 dark:text-zinc-300">{selectedLead.propertyTitle}</span>
                  </p>
                </div>
                <button onClick={() => setSelectedLead(null)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">
                  <X className="w-5 h-5 text-zinc-500" />
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">

                {/* Pipeline progress */}
                <div>
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase mb-3">Pipeline Progress</p>
                  <div className="flex items-center gap-1">
                    {PIPELINE_STEPS.map((step, i) => {
                      const cfg = STATUS_CONFIG[step];
                      const currentOrder = STATUS_CONFIG[selectedLead.status]?.order ?? 0;
                      const stepOrder = cfg.order;
                      const isDone = currentOrder >= stepOrder;
                      return (
                        <div key={step} className="flex items-center flex-1">
                          <div className={`flex-1 h-1.5 rounded-full ${isDone ? 'bg-rose-500' : 'bg-zinc-200 dark:bg-zinc-700'}`} />
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${isDone ? 'bg-rose-500 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400'}`} title={cfg.label}>
                            {cfg.icon}
                          </div>
                          {i === PIPELINE_STEPS.length - 1 && <div className={`flex-1 h-1.5 rounded-full ${currentOrder >= 5 ? 'bg-rose-500' : 'bg-zinc-200 dark:bg-zinc-700'}`} />}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-1 px-1">
                    {PIPELINE_STEPS.map((step) => (
                      <span key={step} className="text-[9px] text-zinc-400 text-center leading-tight">{STATUS_CONFIG[step].label}</span>
                    ))}
                  </div>
                </div>

                {/* Contact info grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Tenant card */}
                  <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 space-y-2">
                    <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase flex items-center gap-1"><User className="w-3.5 h-3.5" /> Tenant</p>
                    <p className="font-semibold text-zinc-900 dark:text-white">{selectedLead.tenantName}</p>
                    <a href={`tel:${selectedLead.tenantPhone}`} className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                      <Phone className="w-4 h-4" />{selectedLead.tenantPhone}
                    </a>
                    {selectedLead.tenantEmail && (
                      <a href={`mailto:${selectedLead.tenantEmail}`} className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline truncate">
                        <Mail className="w-4 h-4" />{selectedLead.tenantEmail}
                      </a>
                    )}
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Inquired: {selectedLead.inquiryDate ? format(new Date(selectedLead.inquiryDate), 'dd MMM yyyy, hh:mm a') : '—'}
                    </p>
                    {selectedLead.source && (
                      <span className="text-xs bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 px-2 py-0.5 rounded-full">Source: {selectedLead.source}</span>
                    )}
                  </div>

                  {/* Property & Owner card */}
                  <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 space-y-2">
                    <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase flex items-center gap-1"><Home className="w-3.5 h-3.5" /> Property / Owner</p>
                    <p className="font-semibold text-zinc-900 dark:text-white">{selectedLead.propertyTitle}</p>
                    {selectedLead.propertyCity && <p className="text-sm text-zinc-500 dark:text-zinc-400">{selectedLead.propertyCity}</p>}
                    {selectedLead.propertyRent ? (
                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">₹{selectedLead.propertyRent.toLocaleString('en-IN')}/month</p>
                    ) : null}
                    <hr className="border-zinc-200 dark:border-zinc-700" />
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">Owner: <strong>{selectedLead.ownerName}</strong></p>
                    {selectedLead.ownerPhone && (
                      <a href={`tel:${selectedLead.ownerPhone}`} className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                        <Phone className="w-4 h-4" />{selectedLead.ownerPhone}
                      </a>
                    )}
                  </div>
                </div>

                {/* Status + Priority */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 uppercase mb-2 block">Lead Status</label>
                    <select
                      value={selectedLead.status}
                      onChange={(e) => update(selectedLead._id, { status: e.target.value })}
                      disabled={actionLoading[selectedLead._id]}
                      className={`w-full px-3 py-2 rounded-lg text-sm font-medium border-0 cursor-pointer disabled:opacity-50 ${STATUS_CONFIG[selectedLead.status]?.bgColor} ${STATUS_CONFIG[selectedLead.status]?.color}`}
                    >
                      {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 uppercase mb-2 block">Priority</label>
                    <select
                      value={selectedLead.priority || 'medium'}
                      onChange={(e) => update(selectedLead._id, { priority: e.target.value }, `${selectedLead._id}-priority`)}
                      disabled={actionLoading[`${selectedLead._id}-priority`]}
                      className={`w-full px-3 py-2 rounded-lg text-sm font-medium border-0 cursor-pointer disabled:opacity-50 ${PRIORITY_CONFIG[selectedLead.priority || 'medium']?.bg} ${PRIORITY_CONFIG[selectedLead.priority || 'medium']?.color}`}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">🔥 High</option>
                    </select>
                  </div>
                </div>

                {/* Notes + Follow-up */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-zinc-500 uppercase block">Internal Notes</label>
                  <textarea
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    placeholder="Add notes, discussion summary, visit feedback…"
                    rows={3}
                    className="w-full px-4 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                  />
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 block">Follow-up Date</label>
                      <input
                        type="date"
                        value={followUpDate}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                        className="w-full px-3 py-1.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                    <button
                      onClick={handleSaveNotes}
                      disabled={actionLoading[`notes-${selectedLead._id}`]}
                      className="self-end px-5 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
                    >
                      {actionLoading[`notes-${selectedLead._id}`] ? <Loader className="w-4 h-4 animate-spin" /> : 'Save'}
                    </button>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  <a
                    href={`tel:${selectedLead.tenantPhone}`}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                  >
                    <Phone className="w-4 h-4" /> Call Tenant
                  </a>
                  {selectedLead.tenantEmail && (
                    <a
                      href={`mailto:${selectedLead.tenantEmail}?subject=Regarding your inquiry for ${encodeURIComponent(selectedLead.propertyTitle)}`}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                      <Mail className="w-4 h-4" /> Email Tenant
                    </a>
                  )}
                  {selectedLead.ownerPhone && (
                    <a
                      href={`tel:${selectedLead.ownerPhone}`}
                      className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 text-sm font-medium"
                    >
                      <Phone className="w-4 h-4" /> Call Owner
                    </a>
                  )}
                  {selectedLead.status === 'closed_booked' && (
                    <span className="ml-auto flex items-center gap-1.5 text-sm font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-3 py-2 rounded-lg">
                      <CheckCircle2 className="w-4 h-4" /> Converted!
                    </span>
                  )}
                  <button
                    onClick={() => setSelectedLead(null)}
                    className="ml-auto px-4 py-2 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
