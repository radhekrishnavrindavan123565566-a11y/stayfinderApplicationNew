'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import FeedbackModal from './FeedbackModal';

export default function FeedbackButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsModalOpen(true)}
        title="Send us your feedback"
        className="fixed bottom-6 right-6 z-30 flex items-center justify-center w-14 h-14 rounded-full bg-rose-500 hover:bg-rose-600 text-white shadow-lg hover:shadow-xl transition-all"
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>

      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
