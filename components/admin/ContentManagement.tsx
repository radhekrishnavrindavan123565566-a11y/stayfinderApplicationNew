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
  BarChart3,
  MessageSquare,
} from 'lucide-react';
import axios from 'axios';
import type { BannerContent, NotificationContent, ContentFilter } from '@/lib/admin/models';

interface ContentManagementProps {
  onContentSelect?: (content: BannerContent | NotificationContent) => void;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function ContentManagement({ onContentSelect }: ContentManagementProps) {
  const [contentType, setContentType] = useState<'banner' | 'notification'>('banner');
  const [banners, setBanners] = useState<BannerContent[]>([]);
  const [notifications, setNotifications] = useState<NotificationContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ContentFilter>({
    type: 'banner',
    status: undefined,
  });
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({
    title: '',
    description: '',
    imageUrl: '',
    message: '',
    channels: [],
  });

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit,
        type: contentType,
        search: searchQuery,
      };

      const endpoint =
        contentType === 'banner'
          ? '/api/admin/banners'
          : '/api/admin/notifications';

      const response = await axios.get(endpoint, { params });

      if (contentType === 'banner') {
        setBanners(response.data.banners);
      } else {
        setNotifications(response.data.notifications);
      }

      setTotal(response.data.total);
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
    setFilters((prev) => ({ ...prev, type: contentType }));
  }, [contentType]);

  useEffect(() => {
    fetchContent();
  }, [page, limit, contentType, searchQuery]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this?')) {
      return;
    }
    try {
      setActionLoading((prev) => ({ ...prev, [id]: true }));
      const endpoint =
        contentType === 'banner'
          ? `/api/admin/banners/${id}`
          : `/api/admin/notifications/${id}`;
      await axios.delete(endpoint);
      fetchContent();
    } catch (err) {
      console.error('Error deleting content:', err);
      alert('Failed to delete content');
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleSaveContent = async () => {
    try {
      setActionLoading((prev) => ({ ...prev, form: true }));

      if (contentType === 'banner') {
        if (!formData.title || !formData.imageUrl) {
          alert('Please fill in all required fields');
          return;
        }

        if (editingId) {
          await axios.put(`/api/admin/banners/${editingId}`, formData);
        } else {
          await axios.post('/api/admin/banners', formData);
        }
      } else {
        if (!formData.title || !formData.message || formData.channels.length === 0) {
          alert('Please fill in all required fields');
          return;
        }

        if (editingId) {
          await axios.put(`/api/admin/notifications/${editingId}`, formData);
        } else {
          await axios.post('/api/admin/notifications', formData);
        }
      }

      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        imageUrl: '',
        message: '',
        channels: [],
      });
      setEditingId(null);
      fetchContent();
    } catch (err) {
      console.error('Error saving content:', err);
      alert('Failed to save content');
    } finally {
      setActionLoading((prev) => ({ ...prev, form: false }));
    }
  };

  const totalPages = Math.ceil(total / limit);
  const currentContent = contentType === 'banner' ? banners : notifications;

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <motion.div initial="hidden" animate="show" variants={fadeUp} className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white">
            Content Management
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowForm(true);
                setEditingId(null);
                setFormData({
                  title: '',
                  description: '',
                  imageUrl: '',
                  message: '',
                  channels: [],
                });
              }}
              className="flex items-center gap-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg px-4 py-2 hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add New
            </button>
            <button
              onClick={() => fetchContent()}
              className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Content Type Tabs */}
        <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setContentType('banner')}
            className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors ${
              contentType === 'banner'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Banners
          </button>
          <button
            onClick={() => setContentType('notification')}
            className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors ${
              contentType === 'notification'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Bell className="w-4 h-4" />
            Notifications
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            placeholder={`Search ${contentType === 'banner' ? 'banners' : 'notifications'}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </motion.div>

      {/* Form Modal */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowForm(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-white dark:bg-zinc-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-zinc-200 dark:border-zinc-800"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">
              {editingId ? 'Edit' : 'Create'} {contentType === 'banner' ? 'Banner' : 'Notification'}
            </h2>

            <div className="space-y-4">
              {/* Common Fields */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter title"
                  className="w-full px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Banner Fields */}
              {contentType === 'banner' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Image URL *
                    </label>
                    <input
                      type="text"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Optional description"
                      rows={3}
                      className="w-full px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {formData.imageUrl && (
                    <div className="relative w-full h-48 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden">
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.png';
                        }}
                      />
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Message *
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Notification message"
                      rows={4}
                      className="w-full px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                      Channels *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {['in_app', 'whatsapp', 'sms', 'email'].map((channel) => (
                        <label
                          key={channel}
                          className="flex items-center gap-2 p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer"
                        >
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
                                  channels: formData.channels.filter((c: string) => c !== channel),
                                });
                              }
                            }}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            {channel === 'in_app'
                              ? 'In-App'
                              : channel === 'whatsapp'
                              ? 'WhatsApp'
                              : channel.toUpperCase()}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveContent}
                disabled={actionLoading['form']}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {actionLoading['form'] ? 'Saving...' : 'Save'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Content Table */}
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
        ) : currentContent.length === 0 ? (
          <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-12 text-center border border-zinc-200 dark:border-zinc-800">
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">No content found</p>
            <button
              onClick={() => {
                setShowForm(true);
                setFormData({
                  title: '',
                  description: '',
                  imageUrl: '',
                  message: '',
                  channels: [],
                });
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create First {contentType === 'banner' ? 'Banner' : 'Notification'}
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                  <tr>
                    {contentType === 'banner' ? (
                      <>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                          Banner
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                          Analytics
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                          Actions
                        </th>
                      </>
                    ) : (
                      <>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                          Notification
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                          Channels
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                          Actions
                        </th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {currentContent.map((content: any) => (
                    <tr
                      key={content._id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      {contentType === 'banner' ? (
                        <>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {content.imageUrl && (
                                <img
                                  src={content.imageUrl}
                                  alt={content.title}
                                  className="w-12 h-12 rounded object-cover"
                                />
                              )}
                              <div>
                                <p className="font-medium text-zinc-900 dark:text-white">
                                  {content.title}
                                </p>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-1">
                                  {content.description}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <span className="text-sm font-medium">
                                  {content.impressions || 0} views
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-green-600 dark:text-green-400" />
                                <span className="text-sm font-medium">
                                  {content.clicks || 0} clicks
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                content.isActive
                                  ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300'
                                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                              }`}
                            >
                              {content.isActive ? '✓ Active' : '✗ Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div
                              className="flex items-center gap-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => {
                                  setEditingId(content._id);
                                  setFormData(content);
                                  setShowForm(true);
                                }}
                                className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors"
                              >
                                <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              </button>
                              <button
                                onClick={() => handleDelete(content._id)}
                                disabled={actionLoading[content._id]}
                                className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors disabled:opacity-50"
                              >
                                <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-zinc-900 dark:text-white">
                                {content.title}
                              </p>
                              <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
                                {content.message}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {content.channel?.map((ch: string) => (
                                <span
                                  key={ch}
                                  className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                                >
                                  {ch === 'in_app' ? 'In-App' : ch.toUpperCase()}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                content.status === 'sent'
                                  ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300'
                                  : content.status === 'draft'
                                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                                  : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300'
                              }`}
                            >
                              {content.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div
                              className="flex items-center gap-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => {
                                  setEditingId(content._id);
                                  setFormData(content);
                                  setShowForm(true);
                                }}
                                className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors"
                              >
                                <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              </button>
                              <button
                                onClick={() => handleDelete(content._id)}
                                disabled={actionLoading[content._id]}
                                className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors disabled:opacity-50"
                              >
                                <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}{' '}
                items
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
