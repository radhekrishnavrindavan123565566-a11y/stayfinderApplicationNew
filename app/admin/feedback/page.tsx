'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MessageCircle, Star, Search, Filter, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Link from 'next/link';
import clsx from 'clsx';
import { useAuthStore } from '@/store/authStore';

interface Feedback {
  _id: string;
  userId: { _id: string; username: string; email: string; avatar?: string };
  category: 'bug' | 'feature' | 'improvement' | 'other';
  title: string;
  description: string;
  rating?: number;
  status: 'new' | 'reviewed' | 'in-progress' | 'resolved' | 'closed';
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminFeedbackPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'reviewed' | 'in-progress' | 'resolved' | 'closed'>('all');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'bug' | 'feature' | 'improvement' | 'other'>('all');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');

  useEffect(() => {
    // Check if user is admin
    if (user && user.role !== 'admin') {
      toast.error('Access denied. Admin only.');
      router.push('/dashboard');
      return;
    }
    
    if (!user) {
      router.push('/auth/login');
      return;
    }

    loadFeedback();
  }, [user, router]);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/feedback', {
        params: { limit: 100, status: filter !== 'all' ? filter : undefined },
      });
      setFeedbacks(response.data.data.feedback);
    } catch (error) {
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadFeedback();
    }
  }, [filter, user]);

  const handleStatusChange = async (feedbackId: string, newStatus: string) => {
    try {
      await axios.put(`/api/feedback/${feedbackId}`, { status: newStatus });
      toast.success('Feedback status updated');
      loadFeedback();
      setSelectedFeedback(null);
    } catch (error) {
      toast.error('Failed to update feedback');
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen pt-20 pb-16 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Access Denied</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">Only admins can view all feedback.</p>
          <Link href="/dashboard" className="px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const filteredFeedbacks = feedbacks.filter((f) => {
    const matchesSearch =
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      f.description.toLowerCase().includes(search.toLowerCase()) ||
      f.userId.username.toLowerCase().includes(search.toLowerCase()) ||
      f.userId.email.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || f.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

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

  const stats = [
    { label: 'Total', value: feedbacks.length, color: 'text-blue-600' },
    { label: 'New', value: feedbacks.filter((f) => f.status === 'new').length, color: 'text-blue-600' },
    { label: 'Reviewed', value: feedbacks.filter((f) => f.status === 'reviewed').length, color: 'text-purple-600' },
    { label: 'In Progress', value: feedbacks.filter((f) => f.status === 'in-progress').length, color: 'text-amber-600' },
    { label: 'Resolved', value: feedbacks.filter((f) => f.status === 'resolved').length, color: 'text-green-600' },
  ];

  return (
    <div className="min-h-screen pt-20 pb-16 bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">All Feedback</h1>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400">
            Manage and respond to user feedback
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800"
            >
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{stat.label}</p>
              <p className={clsx('text-2xl font-bold', stat.color)}>{stat.value}</p>
            </div>
          ))}
        </motion.div>

        {/* Filters & Search */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800 mb-6 space-y-4"
        >
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search feedback, user, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {(['all', 'new', 'reviewed', 'in-progress', 'resolved', 'closed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={clsx(
                  'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                  filter === status
                    ? 'bg-rose-500 text-white'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                )}
              >
                {status.replace('-', ' ').toUpperCase()}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {(['all', 'bug', 'feature', 'improvement', 'other'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={clsx(
                  'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                  categoryFilter === cat
                    ? 'bg-blue-500 text-white'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                )}
              >
                {cat === 'all' ? 'All Categories' : cat.toUpperCase()}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Feedback List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500" />
          </div>
        ) : filteredFeedbacks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800"
          >
            <MessageCircle className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-600 dark:text-zinc-400">No feedback found</p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filteredFeedbacks.map((feedback, index) => (
              <motion.div
                key={feedback._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedFeedback(feedback)}
                className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start gap-3 mb-2">
                  <span className="text-2xl">{getCategoryIcon(feedback.category)}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-zinc-900 dark:text-white truncate">
                      {feedback.title}
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      by {feedback.userId.username} ({feedback.userId.email})
                    </p>
                  </div>
                </div>

                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3 line-clamp-2">
                  {feedback.description}
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <span className={clsx('text-xs px-2 py-1 rounded-full font-medium', getStatusColor(feedback.status))}>
                    {feedback.status.replace('-', ' ').toUpperCase()}
                  </span>

                  {feedback.rating && (
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={clsx(
                            'w-3 h-3',
                            i < feedback.rating!
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-zinc-300 dark:text-zinc-600'
                          )}
                        />
                      ))}
                    </div>
                  )}

                  {feedback.isPublic && (
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded-full">
                      Public
                    </span>
                  )}

                  <span className="text-xs text-zinc-500 dark:text-zinc-500 ml-auto">
                    {new Date(feedback.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {selectedFeedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setSelectedFeedback(null)}
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-zinc-900 rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto shadow-xl"
            >
              <div className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getCategoryIcon(selectedFeedback.category)}</span>
                      <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                        {selectedFeedback.title}
                      </h2>
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      from {selectedFeedback.userId.username} ({selectedFeedback.userId.email})
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Description</p>
                  <p className="text-zinc-600 dark:text-zinc-400">{selectedFeedback.description}</p>
                </div>

                {/* Meta */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Status</p>
                    <span className={clsx('text-xs px-2 py-1 rounded-full font-medium inline-block', getStatusColor(selectedFeedback.status))}>
                      {selectedFeedback.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Category</p>
                    <p className="text-sm">{selectedFeedback.category.toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Rating</p>
                    <p className="text-sm">{selectedFeedback.rating ? `${selectedFeedback.rating}/5` : 'N/A'}</p>
                  </div>
                </div>

                {/* Status Change */}
                <div>
                  <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Change Status</p>
                  <div className="flex gap-2 flex-wrap">
                    {(['new', 'reviewed', 'in-progress', 'resolved', 'closed'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(selectedFeedback._id, status)}
                        disabled={selectedFeedback.status === status}
                        className={clsx(
                          'px-3 py-1 rounded text-sm font-medium transition-colors',
                          selectedFeedback.status === status
                            ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 cursor-default'
                            : 'bg-rose-500 hover:bg-rose-600 text-white'
                        )}
                      >
                        {status.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setSelectedFeedback(null)}
                  className="w-full px-4 py-2 bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors mt-4"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
