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
    content: `By downloading, installing, or using the MatchNest application, you ("User," "Owner," or "Tenant") agree to be bound by these Terms and Conditions. If you do not agree, please discontinue use immediately.`,
  },
  {
    id: "scope",
    icon: <Shield className="w-5 h-5" />,
    title: "2. Scope of Service (The Mediator Role)",
    color: "bg-blue-50 dark:bg-blue-950/30 text-blue-500",
    content: `MatchNest is a digital platform acting as an Intermediary under the Information Technology Act.

• Nature of Business: We provide a portal where individual property owners, PG managers, and Hotel operators can list available rooms.
• No Ownership: MatchNest does not own, inspect, or manage any of the listed properties. We are a bridge, not a landlord.`,
  },
  {
    id: "users",
    icon: <Users className="w-5 h-5" />,
    title: "3. User Categories & Obligations",
    color: "bg-green-50 dark:bg-green-950/30 text-green-500",
    content: `A. For Property Owners (Individual / PG / Hotel):

• Legal Ownership: You represent that you have the legal right to rent the premises.
• Accuracy: You must provide genuine photos and descriptions. Under IT Rules 2026, the use of AI-generated or "Deepfake" images to misrepresent a property is strictly prohibited.
• UP Tenancy Compliance: Owners must comply with the UP Regulation of Urban Premises Tenancy Act, 2021, which mandates a written rent agreement for all tenancies.

B. For Tenants:

• Verification: You are solely responsible for inspecting the property and verifying the Owner's identity before making any payment.
• Conduct: You agree to use the platform only for lawful housing searches.`,
  },
  {
    id: "listings",
    icon: <BookOpen className="w-5 h-5" />,
    title: "4. Listing & Advertising Policy",
    color: "bg-amber-50 dark:bg-amber-950/30 text-amber-500",
    content: `• Verification Icons: MatchNest may provide a "Verified" badge to some listings. This badge only indicates that basic document checks (like Aadhaar) were performed and does not guarantee the safety of the neighborhood or the quality of the stay.
• Service Fees: MatchNest may charge a convenience fee for premium listings or successful matches. All fees are subject to GST (18% as of current norms).`,
  },
  {
    id: "deposits",
    icon: <CreditCard className="w-5 h-5" />,
    title: "5. Security Deposits & Rent (UP Laws)",
    color: "bg-purple-50 dark:bg-purple-950/30 text-purple-500",
    content: `In accordance with the Model Tenancy Act followed in Uttar Pradesh:

• Deposit Cap: For residential properties, security deposits are generally capped at 2 months' rent.
• Transactions: MatchNest is not responsible for the collection, handling, or refund of security deposits. These must be transacted directly between Owner and Tenant.`,
  },
  {
    id: "privacy",
    icon: <Lock className="w-5 h-5" />,
    title: "6. Data Privacy (DPDP Act 2023 Compliance)",
    color: "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500",
    content: `• Consent: By using MatchNest, you consent to the processing of your digital personal data (Name, Phone Number, Location) for the purpose of matching you with a room/tenant.
• Data Erasure: Users have the right to request the deletion of their account and associated data at any time through the app settings.`,
  },
  {
    id: "safety",
    icon: <Shield className="w-5 h-5" />,
    title: "7. Safety & Police Verification",
    color: "bg-teal-50 dark:bg-teal-950/30 text-teal-500",
    content: `• Mandatory Requirement: In major UP cities (Lucknow, Kanpur, Noida, etc.), Police Verification of tenants is a legal requirement for the Owner.
• Disclaimer: MatchNest does not perform police verification. Owners must complete this process through the UP Police "Citizen Service" Portal/App independently.`,
  },
  {
    id: "liability",
    icon: <Scale className="w-5 h-5" />,
    title: "8. Limitation of Liability",
    color: "bg-zinc-100 dark:bg-zinc-800 text-zinc-500",
    content: `MatchNest shall not be liable for:

1. Financial loss due to scams or off-platform transactions.
2. Property damage caused by tenants.
3. Eviction disputes or legal conflicts between Owner and Tenant.
4. Variations in room quality compared to online photos.`,
  },
  {
    id: "conduct",
    icon: <AlertTriangle className="w-5 h-5" />,
    title: "9. Prohibited Conduct",
    color: "bg-red-50 dark:bg-red-950/30 text-red-500",
    content: `• Posting fraudulent listings or "Bait and Switch" pricing.
• Using the app to bypass the mediation process once a contact is initiated.
• Discriminating against users based on religion, caste, gender, or food preferences in a way that violates Indian Constitutional laws.`,
  },
  {
    id: "grievance",
    icon: <Mail className="w-5 h-5" />,
    title: "10. Grievance Redressal",
    color: "bg-orange-50 dark:bg-orange-950/30 text-orange-500",
    content: `In compliance with IT Rules 2026, MatchNest has appointed a Grievance Officer to address complaints regarding content or service.

• Contact: grievance@matchnest.com
• Timeline: Takedown requests for illegal content or fake profiles will be addressed within 24–72 hours.`,
  },
  {
    id: "contact",
    icon: <Scale className="w-5 h-5" />,
    title: "11. Governing Law & Jurisdiction",
    color: "bg-rose-50 dark:bg-rose-950/30 text-rose-500",
    content: `These terms are governed by the laws of India and the State of Uttar Pradesh. Any legal proceedings shall be subject to the exclusive jurisdiction of the Courts at Prayagraj, UP.

Last Updated: April 18, 2026
Jurisdiction: Prayagraj, Uttar Pradesh, India`,
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
            Please read these terms carefully before using MatchNest. They govern your use of our platform and services.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 inline-flex items-center gap-2 text-white/50 text-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Last updated: April 18, 2026
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
              By using MatchNest, you agree to these terms. If you have questions, contact us at{" "}
              <a href="mailto:grievance@matchnest.com" className="underline font-medium">grievance@matchnest.com</a> before proceeding.
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

      {/* ── I Agree Summary ── */}
      <section className="py-10 px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-2xl p-6"
        >
          <p className="font-bold text-rose-700 dark:text-rose-300 text-base mb-3">
            "I Agree" Summary
          </p>
          <p className="text-rose-600 dark:text-rose-400 text-sm mb-4 leading-relaxed">
            By clicking "I Agree," I understand that:
          </p>
          <ol className="space-y-2 text-sm text-rose-700 dark:text-rose-300 list-decimal list-inside leading-relaxed">
            <li>MatchNest is a <span className="font-semibold">Mediator</span>, not a Landlord.</li>
            <li>I must <span className="font-semibold">verify</span> the property and person before paying any money.</li>
            <li>I will comply with <span className="font-semibold">UP Tenancy Laws</span> including written agreements.</li>
            <li>My data will be used securely to help find me a match.</li>
          </ol>
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
            Our team is happy to clarify anything. Reach out and we&apos;ll respond within 24–72 hours.
          </p>
          <a
            href="mailto:grievance@matchnest.com"
            className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-rose-500/25"
          >
            <Mail className="w-4 h-4" />
            Contact Grievance Officer
          </a>
        </motion.div>
      </section>
    </div>
  );
}
