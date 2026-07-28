"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

interface WhatsAppShareProps {
  phoneNumber: string;
  message?: string;
  propertyTitle?: string;
  className?: string;
}

export function WhatsAppShare({
  phoneNumber,
  message,
  propertyTitle,
  className = "",
}: WhatsAppShareProps) {
  const handleWhatsAppClick = () => {
    // Format phone number for WhatsApp (remove leading +, add country code if needed)
    const formattedPhone = phoneNumber.replace(/\D/g, "");

    // Create WhatsApp message
    const defaultMessage =
      message ||
      (propertyTitle
        ? `Hi! I'm interested in ${propertyTitle}. Can you share more details?`
        : "Hi! I'm interested in this property. Can you share more details?");

    // WhatsApp Web URL
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(
      defaultMessage
    )}`;

    window.open(whatsappUrl, "_blank");
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleWhatsAppClick}
      className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-medium transition-colors ${className}`}
    >
      <MessageCircle className="w-4 h-4" />
      WhatsApp
    </motion.button>
  );
}

interface WhatsAppContactCardProps {
  ownerName: string;
  phoneNumber: string;
  propertyTitle: string;
}

export function WhatsAppContactCard({
  ownerName,
  phoneNumber,
  propertyTitle,
}: WhatsAppContactCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800/50 space-y-3"
    >
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white text-lg">
          <MessageCircle className="w-5 h-5" />
        </div>
        <div>
          <p className="font-medium text-zinc-900 dark:text-white">
            Contact {ownerName}
          </p>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Chat on WhatsApp
          </p>
        </div>
      </div>

      <WhatsAppShare
        phoneNumber={phoneNumber}
        propertyTitle={propertyTitle}
        className="w-full"
      />

      <p className="text-xs text-zinc-600 dark:text-zinc-400">
        💡 WhatsApp is the fastest way to reach out and ask questions about{" "}
        {propertyTitle}
      </p>
    </motion.div>
  );
}
