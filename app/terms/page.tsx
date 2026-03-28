"use client";
import { useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  FileText, Shield, CreditCard, Users, AlertTriangle,
  Lock, RefreshCw, Mail, ChevronDown, BookOpen, Scale,
} from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" },
  }),
};
const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

const SECTIONS = [
  {
    id: "acceptance",
    icon: <FileText className="w-5 h-5" />,
    title: "1. Acceptance of Terms",
    color: "bg-rose-50 dark:bg-rose-950/30 text-rose-500",
    content: `By accessing or using StayFinder ("the Platform"), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.

These terms apply to all visitors, users, and others who access or use the Platform, including guests, property owners, and administrators.

We reserve the right to update these terms at any time. Continued use of the Platform after changes constitutes acceptance of the new terms. We will notify users of significant changes via email or prominent notice on the Platform.`,
  },
  {
    id: "accounts",
    icon: <Users className="w-5 h-5" />,
    title: "2. User Accounts",
    color: "bg-blue-50 dark:bg-blue-950/30 text-blue-500",
    content: `To access certain features, you must create an account. You are responsible for:

• Maintaining the confidentiality of your account credentials
• All activities that occur under your account
• Providing accurate, current, and complete information
• Notifying us immediately of any unauthorized use

You must be at least 18 years old to create an account. We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.

Account types include Guest (tenant), Property Owner, and Administrator. Each role has specific permissions and responsibilities outlined in this agreement.`,
  },
  {
    id: "listings",
    icon: <Shield className="w-5 h-5" />,
    title: "3. Property Listings",
    color: "bg-green-50 dark:bg-green-950/30 text-green-500",
    content: `Property owners who list on StayFinder agree to:

• Provide accurate and truthful descriptions of their properties
• Upload genuine, unedited photographs of the actual property
• Maintain availability calendars in real-time
• Honor all confirmed bookings unless extraordinary circumstances apply
• Comply with all local laws, regulations, and zoning requirements
• Obtain all necessary permits and licenses for short-term rentals

StayFinder reserves the right to remove any listing that violates these terms, contains misleading information, or receives consistent negative reviews. Owners are solely responsible for the accuracy of their listings.`,
  },
  {
    id: "payments",
    icon: <CreditCard className="w-5 h-5" />,
    title: "4. Payments & Fees",
    color: "bg-amber-50 dark:bg-amber-950/30 text-amber-500",
    content: `StayFinder uses a secure escrow payment system:

• Payments are held in escrow until the guest confirms check-in
• A platform fee of 5–12% applies to each transaction
• Property owners receive their earnings within 3–5 business days after check-in confirmation
• All prices are displayed in USD unless otherwise specified

Refunds are subject to the property's cancellation policy. StayFinder's platform fee is non-refundable except in cases of platform error. We use Stripe for payment processing and do not store credit card information on our servers.

Boosted listings are charged a one-time fee of $29.99 for 7 days of featured placement.`,
  },
  {
    id: "cancellations",
    icon: <RefreshCw className="w-5 h-5" />,
    title: "5. Cancellations & Refunds",
    color: "bg-purple-50 dark:bg-purple-950/30 text-purple-500",
    content: `Cancellation policies are set by property owners and fall into three categories:

Flexible: Full refund if cancelled 24+ hours before check-in.
Moderate: Full refund if cancelled 5+ days before check-in; 50% refund within 5 days.
Strict: 50% refund if cancelled 7+ days before check-in; no refund within 7 days.

In cases of property misrepresentation, safety concerns, or platform errors, StayFinder may issue full refunds at its discretion. Disputes must be filed within 48 hours of check-in. Our dispute resolution team will review all claims within 5 business days.`,
  },
  {
    id: "conduct",
    icon: <AlertTriangle className="w-5 h-5" />,
    title: "6. Prohibited Conduct",
    color: "bg-red-50 dark:bg-red-950/30 text-red-500",
    content: `Users are strictly prohibited from:

• Posting false, misleading, or fraudulent listings or reviews
• Harassing, threatening, or discriminating against other users
• Attempting to circumvent the platform to avoid fees
• Using the platform for illegal activities of any kind
• Scraping, crawling, or data-mining the platform without permission
• Creating multiple accounts to manipulate ratings or reviews
• Sharing account credentials with unauthorized parties
• Violating any applicable local, state, or federal laws

Violations may result in immediate account suspension, legal action, and reporting to relevant authorities.`,
  },
  {
    id: "privacy",
    icon: <Lock className="w-5 h-5" />,
    title: "7. Privacy & Data",
    color: "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500",
    content: `Your privacy matters to us. We collect and process personal data in accordance with our Privacy Policy, which is incorporated into these Terms by reference.

We collect information you provide directly (name, email, payment info), information generated by your use of the platform (bookings, reviews, messages), and technical data (IP address, device info, cookies).

We use this data to provide and improve our services, process payments, prevent fraud, and communicate with you. We do not sell your personal data to third parties. We may share data with service providers who assist in operating the platform under strict confidentiality agreements.

You have the right to access, correct, or delete your personal data at any time by contacting us at privacy@stayfinder.com.`,
  },
  {
    id: "liability",
    icon: <Scale className="w-5 h-5" />,
    title: "8. Limitation of Liability",
    color: "bg-zinc-100 dark:bg-zinc-800 text-zinc-500",
    content: `StayFinder acts as a marketplace connecting guests and property owners. We are not a party to the rental agreement between guests and owners.

To the maximum extent permitted by law, StayFinder shall not be liable for:

• Any indirect, incidental, special, or consequential damages
• Loss of profits, data, or goodwill
• Property damage or personal injury occurring during a stay
• Actions or omissions of property owners or guests
• Third-party services or content linked from our platform

Our total liability for any claim shall not exceed the amount paid by you to StayFinder in the 12 months preceding the claim. Some jurisdictions do not allow limitation of liability, so these limitations may not apply to you.`,
  },
  {
    id: "contact",
    icon: <Mail className="w-5 h-5" />,
    title: "9. Contact & Governing Law",
    color: "bg-teal-50 dark:bg-teal-950/30 text-teal-500",
    content: `These Terms are governed by the laws of the State of New York, United States, without regard to conflict of law principles.

Any disputes arising from these Terms shall be resolved through binding arbitration in New York, NY, except that either party may seek injunctive relief in court for intellectual property violations.

For questions about these Terms, contact us at:

Email: legal@stayfinder.com
Address: 123 Stay Street, New York, NY 10001
Phone: +1 (800) 123-4567

Last updated: March 28, 2026`,
  },
];

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 overflow-x-hidden">

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-16 px-4 overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
        {/* Animated background */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 10 }).map((_, i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.12, 0.05] }}
              transition={{ duration: 5 + i * 0.6, repeat: Infinity, delay: i * 0.5 }}
              className="absolute rounded-full bg-rose-500"
              style={{
                width: `${80 + i * 30}px`,
                height: `${80 + i * 30}px`,
                left: `${(i * 10) % 90}%`,
                top: `${(i * 13) % 90}%`,
              }}
            />
          ))}
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-sm font-medium px-4 py-1.5 rounded-full mb-6"
          >
            <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}>
              <BookOpen className="w-4 h-4" />
            </motion.span>
            Legal Agreement
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7, ease: "easeOut" }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight"
          >
            Terms &amp;{" "}
            <span className="text-rose-400">Conditions</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="text-white/70 text-lg max-w-xl mx-auto"
          >
            Please read these terms carefully before using StayFinder. They govern your use of our platform and services.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 inline-flex items-center gap-2 text-white/50 text-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Last updated: March 28, 2026
          </motion.div>
        </div>
      </section>

      {/* ── Quick nav ── */}
      <section className="sticky top-16 z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {SECTIONS.map((s) => (
              <motion.button
                key={s.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setActiveSection(s.id);
                  document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  activeSection === s.id
                    ? "bg-rose-500 text-white"
                    : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                {s.icon}
                <span className="hidden sm:inline">{s.title.split(". ")[1]}</span>
                <span className="sm:hidden">{s.title.split(". ")[0]}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Content ── */}
      <section className="py-12 px-4 max-w-4xl mx-auto">
        {/* Intro banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-2xl p-5 mb-10 flex gap-4"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
            className="flex-shrink-0"
          >
            <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
          </motion.div>
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-300 text-sm">Important Notice</p>
            <p className="text-amber-700 dark:text-amber-400 text-sm mt-0.5 leading-relaxed">
              By using StayFinder, you agree to these terms. If you have questions, contact us at{" "}
              <a href="mailto:legal@stayfinder.com" className="underline font-medium">legal@stayfinder.com</a> before proceeding.
            </p>
          </div>
        </motion.div>

        {/* Sections — accordion on mobile, expanded on desktop */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {SECTIONS.map((section, i) => (
            <motion.div
              key={section.id}
              id={section.id}
              custom={i}
              variants={fadeUp}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden scroll-mt-32"
            >
              {/* Section header */}
              <button
                onClick={() => setOpenSection(openSection === section.id ? null : section.id)}
                className="w-full flex items-center gap-4 px-5 sm:px-6 py-5 text-left group"
              >
                <motion.div
                  animate={{ rotate: [0, 8, -8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 + i * 0.3 }}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${section.color}`}
                >
                  {section.icon}
                </motion.div>
                <span className="flex-1 font-semibold text-zinc-900 dark:text-white text-sm sm:text-base">
                  {section.title}
                </span>
                <motion.div
                  animate={{ rotate: openSection === section.id ? 180 : 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex-shrink-0 text-zinc-400 dark:text-zinc-500 group-hover:text-rose-500 transition-colors"
                >
                  <ChevronDown className="w-5 h-5" />
                </motion.div>
              </button>

              {/* Section content */}
              <AnimatePresence initial={false}>
                {openSection === section.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 sm:px-6 pb-6 pt-0">
                      <div className="h-px bg-zinc-100 dark:bg-zinc-800 mb-5" />
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line">
                        {section.content}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        {/* Expand all hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <button
            onClick={() => setOpenSection(openSection ? null : SECTIONS[0].id)}
            className="text-sm text-zinc-400 dark:text-zinc-500 hover:text-rose-500 transition-colors"
          >
            {openSection ? "Collapse section" : "Click any section to expand"}
          </button>
        </motion.div>
      </section>

      {/* ── Footer CTA ── */}
      <section className="py-16 px-4 bg-zinc-50 dark:bg-zinc-900/50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            className="inline-block mb-4"
          >
            <Scale className="w-10 h-10 text-rose-500 mx-auto" />
          </motion.div>
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-3">
            Questions about our terms?
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-6">
            Our legal team is happy to clarify anything. Reach out and we&apos;ll respond within 24 hours.
          </p>
          <a
            href="mailto:legal@stayfinder.com"
            className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-rose-500/25"
          >
            <Mail className="w-4 h-4" />
            Contact Legal Team
          </a>
        </motion.div>
      </section>
    </div>
  );
}
