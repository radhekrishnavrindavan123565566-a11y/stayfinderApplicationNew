'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Trash2, Edit2, Star, AlertCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import FeedbackModal from '@/components/feedback/FeedbackModal';
import clsx from 'clsx';

interface Feedback {
  _id: string;
  category: 'bug' | 'feature' | 'improvement' | 'other';
  title: string;
  description: string;
  rating?: number;
  status: 'new' | 'reviewed' | 'in-progress' | 'resolved' | 'closed';
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function FeedbackPage() {
  const { ready, user } = useRequireAuth();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'new' | 'reviewed' | 'resolved'>('all');

  const loadFeedback = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/feedback', {
        params: { userOnly: true, limit: 50 },
      });
      setFeedback(response.data.data.feedback);
    } catch (error) {
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ready && user) {
      loadFeedback();
    }
  }, [ready, user]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return;

    try {
      await axios.delete(`/api/feedback/${id}`);
      toast.success('Feedback deleted');
      setFeedback(feedback.filter((f) => f._id !== id));
    } catch (error) {
      toast.error('Failed to delete feedback');
    }
  };

  const filteredFeedback =
    filter === 'all' ? feedback : feedback.filter((f) => f.status === filter);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500" />
      </div>
    );
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      bug: '🐛',
      feature: '✨',
      improvement: '🎯',
      other: '💬',
    };
    return icons[category] || '💬';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
      reviewed: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
      'in-progress': 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
      resolved: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
      closed: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-900/20 dark:text-zinc-400',
    };
    return colors[status] || colors.new;
  };

  return (
    <div className="min-h-screen pt-20 pb-16 bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900/20 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            </div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">My Feedback</h1>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400">
            View and manage your feedback submissions
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3 mb-6"
        >
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-lg transition-colors"
          >
            + New Feedback
          </button>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-2 mb-6 overflow-x-auto pb-2"
        >
          {(['all', 'new', 'reviewed', 'resolved'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={clsx(
                'px-4 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                filter === status
                  ? 'bg-rose-500 text-white'
                  : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
              )}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </motion.div>

        {/* Feedback List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500" />
          </div>
        ) : filteredFeedback.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800"
          >
            <MessageCircle className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-600 dark:text-zinc-400">
              {filter === 'all'
                ? 'No feedback submitted yet'
                : `No ${filter} feedback`}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredFeedback.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getCategoryIcon(item.category)}</span>
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white truncate">
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-3 line-clamp-2">
                      {item.description}
                    </p>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={clsx(
                          'text-xs px-2 py-1 rounded-full font-medium',
                          getStatusColor(item.status)
                        )}
                      >
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>

                      {item.rating && (
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={clsx(
                                'w-3 h-3',
                                i < item.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-zinc-300 dark:text-zinc-600'
                              )}
                            />
                          ))}
                        </div>
                      )}

                      {item.isPublic && (
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded-full">
                          Public
                        </span>
                      )}

                      <span className="text-xs text-zinc-500 dark:text-zinc-500 ml-auto">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                      title="Delete feedback"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitSuccess={loadFeedback}
      />
    </div>
  );
}
