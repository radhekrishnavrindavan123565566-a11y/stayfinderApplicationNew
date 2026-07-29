'use client';

import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import FeedbackForm from './FeedbackForm';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess?: () => void;
}

export default function FeedbackModal({ isOpen, onClose, onSubmitSuccess }: FeedbackModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Send Feedback</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Help us improve your experience
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-96 overflow-y-auto">
            <FeedbackForm
              onSubmitSuccess={() => {
                onSubmitSuccess?.();
                setTimeout(onClose, 2000);
              }}
              onClose={onClose}
            />
          </div>
        </div>
      </motion.div>
    </>
  );
}
