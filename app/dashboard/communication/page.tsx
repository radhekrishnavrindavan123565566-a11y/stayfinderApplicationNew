"use client";

import { useRequireAuth } from "@/hooks/useRequireAuth";
import { motion, type Variants } from "framer-motion";
import BackButton from "@/components/ui/BackButton";
import { AutomatedReplies } from "@/components/communication";
import { MessageCircle, Send, Mic, Phone, Settings } from "lucide-react";
import Link from "next/link";

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

function FeatureCard({
  icon: Icon,
  title,
  description,
  href,
  badge,
  delay,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  href?: string;
  badge?: string;
  delay: number;
}) {
  const content = (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -4 }}
      className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all space-y-3 h-full"
    >
      <div className="flex items-start justify-between">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white">
          <Icon className="w-6 h-6" />
        </div>
        {badge && (
          <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
            {badge}
          </span>
        )}
      </div>
      <div>
        <h3 className="font-bold text-zinc-900 dark:text-white">{title}</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{description}</p>
      </div>
    </motion.div>
  );

  if (href) {
    return (
      <Link href={href}>
        {content}
      </Link>
    );
  }

  return content;
}

export default function CommunicationPage() {
  const { ready, user } = useRequireAuth();

  if (!ready || !user) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-rose-500 border-t-transparent" />
      </div>
    );
  }

  const features = [
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Real-time messaging with property owners and tenants. Chat widget available on property pages.",
      badge: "Available",
      href: "/chat",
    },
    {
      icon: Send,
      title: "Property Inquiries",
      description: "Send structured inquiries about availability, pricing, and property details directly to landlords.",
      badge: "Built-in",
    },
    {
      icon: Mic,
      title: "Voice Messages",
      description: "Record and send voice messages for quick communication without typing. Perfect for detailed questions.",
      badge: "New",
    },
    {
      icon: MessageCircle,
      title: "WhatsApp Integration",
      description: "Contact owners directly via WhatsApp for immediate responses. One-click WhatsApp messaging.",
      badge: "Direct",
    },
    {
      icon: Phone,
      title: "Video Call Scheduling",
      description: "Schedule video calls with owners to tour properties virtually. Built-in calendar integration.",
      badge: "Coming",
    },
    {
      icon: Settings,
      title: "Automated Replies",
      description: "Set up automatic responses for common questions. Manage your communication efficiently.",
      badge: "Custom",
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8 pt-6"
        >
          <BackButton />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
              💬 Communication Hub
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">
              Manage all your messaging, calls, and inquiries in one place
            </p>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} {...feature} delay={index * 0.1} />
          ))}
        </motion.div>

        {/* Automated Replies Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm p-8"
        >
          <AutomatedReplies />
        </motion.div>

        {/* Quick Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 p-6 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800/50"
        >
          <h3 className="font-bold text-zinc-900 dark:text-white mb-3">
            💡 Communication Tips
          </h3>
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li>✅ Use WhatsApp for the fastest response from owners</li>
            <li>✅ Send voice messages for complex questions or property tours</li>
            <li>✅ Property inquiries get prioritized by type (visit, availability, etc.)</li>
            <li>✅ Auto-replies help manage inquiries when you're busy</li>
            <li>✅ Check notifications regularly for unread messages</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
