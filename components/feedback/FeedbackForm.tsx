'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Star, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface FeedbackFormProps {
  onSubmitSuccess?: () => void;
  onClose?: () => void;
}

export default function FeedbackForm({ onSubmitSuccess, onClose }: FeedbackFormProps) {
  const [category, setCategory] = useState<'bug' | 'feature' | 'improvement' | 'other'>('other');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/feedback', {
        category,
        title,
        description,
        rating,
        isPublic,
      });

      setSubmitted(true);
      toast.success('Thank you for your feedback!');

      // Reset form after 2 seconds
      setTimeout(() => {
        setTitle('');
        setDescription('');
        setCategory('other');
        setRating(null);
        setIsPublic(false);
        setSubmitted(false);
        onSubmitSuccess?.();
      }, 2000);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'bug', label: '🐛 Bug Report', icon: '🐛' },
    { value: 'feature', label: '✨ Feature Request', icon: '✨' },
    { value: 'improvement', label: '🎯 Improvement', icon: '🎯' },
    { value: 'other', label: '💬 Other', icon: '💬' },
  ];

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-8 px-4"
      >
        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Thank You!</h3>
        <p className="text-zinc-600 dark:text-zinc-400 text-center">
          Your feedback has been submitted successfully. We appreciate your input!
        </p>
      </motion.div>
    );
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Category Selection */}
      <div>
        <label className="block text-sm font-semibold text-zinc-900 dark:text-white mb-2">
          Feedback Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value as any)}
              className={clsx(
                'p-2 rounded-lg border-2 transition-all text-sm font-medium',
                category === cat.value
                  ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400'
                  : 'border-zinc-200 dark:border-zinc-700 hover:border-rose-300 text-zinc-700 dark:text-zinc-300'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-semibold text-zinc-900 dark:text-white mb-2">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Briefly describe your feedback"
          maxLength={200}
          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
        />
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          {title.length}/200
        </p>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-semibold text-zinc-900 dark:text-white mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Provide detailed feedback..."
          maxLength={5000}
          rows={4}
          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
        />
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          {description.length}/5000
        </p>
      </div>

      {/* Rating */}
      {category !== 'bug' && (
        <div>
          <label className="block text-sm font-semibold text-zinc-900 dark:text-white mb-2">
            How would you rate your experience?
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(rating === star ? null : star)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={clsx(
                    'w-6 h-6 transition-colors',
                    rating && rating >= star
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-zinc-300 dark:text-zinc-600'
                  )}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Public Toggle */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="w-4 h-4 rounded border-zinc-300 text-rose-500 focus:ring-rose-500"
          />
          <span className="text-sm text-zinc-700 dark:text-zinc-300">
            Share feedback publicly (can help other users)
          </span>
        </label>
      </div>

      {/* Info */}
      <div className="flex gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
        <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Your feedback helps us improve the application. Thank you!
        </p>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-400 text-white font-medium rounded-lg transition-colors"
        >
          <Send className="w-4 h-4" />
          {loading ? 'Sending...' : 'Send Feedback'}
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 font-medium rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </motion.form>
  );
}
