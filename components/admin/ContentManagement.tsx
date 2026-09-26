'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Loader,
  AlertTriangle,
  Image as ImageIcon,
  Bell,
  Eye,
  Send,
  X,
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useApi } from '@/hooks/useApi';
import { format } from 'date-fns';

interface Banner {
  _id: string;
  title: string;
  description?: string;
  imageUrl: string;
  link?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  viewCount?: number;
  clickCount?: number;
}

interface Notification {
  _id: string;
  title: string;
  message: string;
  channels: ('sms' | 'whatsapp' | 'push' | 'email')[];
  targetAudience: 'all' | 'owners' | 'tenants';
  sentAt?: string;
  sentCount?: number;
  isScheduled?: boolean;
  scheduledAt?: string;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
}

interface ContentManagementProps {
  onContentSelect?: (content: Banner | Notification) => void;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function ContentManagement({ onContentSelect }: ContentManagementProps) {
  const [contentType, setContentType] = useState<'banner' | 'notification'>('banner');
  const [banners, setBanners] = useState<Banner[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({
    title: '',
    description: '',
    imageUrl: '',
    message: '',
    link: '',
    channels: [],
    targetAudience: 'all',
  });
  const { authHeaders } = useApi();

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit,
        search: searchQuery,
      };

      if (contentType === 'banner') {
        const response = await axios.get('/api/admin/banners', { params, ...authHeaders() });
        setBanners(response.data.banners || []);
        setTotal(response.data.total || 0);
      } else {
        const response = await axios.get('/api/admin/notifications', { params, ...authHeaders() });
        setNotifications(response.data.notifications || []);
        setTotal(response.data.total || 0);
      }
    } catch (err) {
      setError('Failed to load content');
      console.error('Content fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [contentType, searchQuery]);

  useEffect(() => {
    fetchContent();
  }, [page, limit, contentType, searchQuery]);

  const handleSaveContent = async () => {
    try {
      setActionLoading((prev) => ({ ...prev, save: true }));

      if (!formData.title || !formData.title.trim()) {
        toast.error('Title is required');
        return;
      }

      const endpoint =
        contentType === 'banner'
          ? editingId
            ? `/api/admin/banners/${editingId}`
            : '/api/admin/banners'
          : editingId
          ? `/api/admin/notifications/${editingId}`
          : '/api/admin/notifications';

      const method = editingId ? 'PATCH' : 'POST';

      await axios({
        method,
        url: endpoint,
        data: contentType === 'banner'
          ? {
              title: formData.title,
              description: formData.description,
              imageUrl: formData.imageUrl,
              link: formData.link,
            }
          : {
              title: formData.title,
              message: formData.message,
              channels: formData.channels,
              targetAudience: formData.targetAudience,
            },
        ...authHeaders(),
      });

      toast.success(editingId ? 'Content updated' : 'Content created');
      setShowForm(false);
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        imageUrl: '',
        message: '',
        link: '',
        channels: [],
        targetAudience: 'all',
      });
      fetchContent();
    } catch (err) {
      toast.error('Failed to save content');
      console.error('Save error:', err);
    } finally {
      setActionLoading((prev) => ({ ...prev, save: false }));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this content?')) return;

    try {
      setActionLoading((prev) => ({ ...prev, [id]: true }));

      const endpoint =
        contentType === 'banner' ? `/api/admin/banners/${id}` : `/api/admin/notifications/${id}`;

      await axios.delete(endpoint, authHeaders());

      toast.success('Content deleted');
      fetchContent();
    } catch (err) {
      toast.error('Failed to delete content');
      console.error('Delete error:', err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleEdit = (item: Banner | Notification) => {
    if ('imageUrl' in item) {
      setFormData({
        title: item.title,
        description: item.description || '',
        imageUrl: item.imageUrl,
        link: item.link || '',
        channels: [],
        targetAudience: 'all',
      });
    } else {
      setFormData({
        title: item.title,
        message: item.message,
        channels: item.channels,
        targetAudience: item.targetAudience,
        description: '',
        imageUrl: '',
        link: '',
      });
    }
    setEditingId(item._id);
    setShowForm(true);
  };

  const handleSendNotification = async (notificationId: string) => {
    try {
      setActionLoading((prev) => ({ ...prev, [`send-${notificationId}`]: true }));
      await axios.post(
        `/api/admin/notifications/${notificationId}/send`,
        {},
        authHeaders()
      );
      toast.success('Notification sent successfully');
      fetchContent();
    } catch (err) {
      toast.error('Failed to send notification');
    } finally {
      setActionLoading((prev) => ({ ...prev, [`send-${notificationId}`]: false }));
    }
  };

  const totalPages = Math.ceil(total / limit);
  const currentItems = contentType === 'banner' ? banners : notifications;

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
            {contentType === 'banner' ? 'Promotional Banners' : 'Notifications & Alerts'}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            {contentType === 'banner'
              ? 'Manage homepage slider and promotional content'
              : 'Send SMS, WhatsApp, and push notifications to users'}
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({
              title: '',
              description: '',
              imageUrl: '',
              message: '',
              link: '',
              channels: [],
              targetAudience: 'all',
            });
          }}
          className="flex items-center gap-2 bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create New
        </button>
      </motion.div>

      {/* Content Type Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800"
      >
        <div className="flex items-center gap-2">
          {(
            [
              { key: 'banner', label: 'Banners', icon: ImageIcon },
              { key: 'notification', label: 'Notifications', icon: Bell },
            ] as const
          ).map(({ key, label, icon: Icon }) => (
            <motion.button
              key={key}
              onClick={() => {
                setContentType(key);
                setPage(1);
              }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                contentType === key
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
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <button
            onClick={fetchContent}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </motion.div>

      {/* Content Grid or List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-12 bg-white dark:bg-zinc-900 rounded-2xl">
            <Loader className="w-8 h-8 text-rose-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12 bg-white dark:bg-zinc-900 rounded-2xl">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-zinc-600 dark:text-zinc-400">{error}</p>
              <button
                onClick={fetchContent}
                className="mt-4 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600"
              >
                Retry
              </button>
            </div>
          </div>
        ) : currentItems.length === 0 ? (
          <div className="flex items-center justify-center py-12 bg-white dark:bg-zinc-900 rounded-2xl">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-600 dark:text-zinc-400">No {contentType}s found</p>
            </div>
          </div>
        ) : contentType === 'banner' ? (
          // Banner Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {banners.map((banner) => (
              <motion.div
                key={banner._id}
                variants={fadeUp}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {banner.imageUrl && (
                  <div className="relative h-40 bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                    <img
                      src={banner.imageUrl}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://via.placeholder.com/300x200?text=Banner';
                      }}
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">
                    {banner.title}
                  </h3>
                  {banner.description && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                      {banner.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                    <span>{banner.viewCount || 0} views</span>
                    <span>{banner.clickCount || 0} clicks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(banner)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(banner._id)}
                      disabled={actionLoading[banner._id]}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          // Notification Table
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Channels
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Audience
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Sent
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {notifications.map((notif) => (
                    <motion.tr
                      key={notif._id}
                      variants={fadeUp}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-zinc-900 dark:text-white">
                            {notif.title}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                            {notif.message}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {notif.channels.map((ch) => (
                            <span
                              key={ch}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                            >
                              {ch}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">
                          {notif.targetAudience === 'all' ? 'All Users' : notif.targetAudience.charAt(0).toUpperCase() + notif.targetAudience.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            notif.status === 'sent'
                              ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                              : notif.status === 'scheduled'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400'
                              : notif.status === 'draft'
                              ? 'bg-gray-100 text-gray-700 dark:bg-gray-950/30 dark:text-gray-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                          }`}
                        >
                          {notif.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">
                          {notif.sentCount || 0} sent
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {notif.status === 'draft' && (
                            <button
                              onClick={() => handleSendNotification(notif._id)}
                              disabled={actionLoading[`send-${notif._id}`]}
                              className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30 rounded-lg transition-colors disabled:opacity-50"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(notif)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(notif._id)}
                            disabled={actionLoading[notif._id]}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            Page {page} of {totalPages} • {total} total {contentType}s
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

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-6 space-y-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                {editingId ? 'Edit' : 'Create'} {contentType === 'banner' ? 'Banner' : 'Notification'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="Enter title"
                />
              </div>

              {contentType === 'banner' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                      placeholder="Enter description"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, imageUrl: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Link (Optional)
                    </label>
                    <input
                      type="url"
                      value={formData.link}
                      onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                      placeholder="https://example.com"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Message
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                      placeholder="Enter message"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Channels
                    </label>
                    <div className="space-y-2">
                      {['sms', 'whatsapp', 'push', 'email'].map((channel) => (
                        <label key={channel} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.channels.includes(channel)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  channels: [...formData.channels, channel],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  channels: formData.channels.filter(
                                    (c: string) => c !== channel
                                  ),
                                });
                              }
                            }}
                            className="w-4 h-4 rounded"
                          />
                          <span className="text-sm text-zinc-700 dark:text-zinc-300 capitalize">
                            {channel}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Target Audience
                    </label>
                    <select
                      value={formData.targetAudience}
                      onChange={(e) =>
                        setFormData({ ...formData, targetAudience: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                    >
                      <option value="all">All Users</option>
                      <option value="owners">Owners Only</option>
                      <option value="tenants">Tenants Only</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="flex-1 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveContent}
                disabled={actionLoading.save}
                className="flex-1 px-4 py-2 rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-colors disabled:opacity-50"
              >
                {actionLoading.save ? <Loader className="w-4 h-4 animate-spin mx-auto" /> : 'Save'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
