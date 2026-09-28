'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, Lock, Eye, Share2, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-6">
          <h1 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white mb-2">
            Privacy Policy
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Last Updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="prose prose-zinc dark:prose-invert max-w-none"
        >
          {/* Registered Office */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">Registered Office</h2>
            <p className="text-zinc-700 dark:text-zinc-300 text-sm mb-0">
              Village Kotar, Post Palpatti, Tehsil Meja, District Prayagraj, Uttar Pradesh – 212106, India
            </p>
          </div>

          {/* 1. Introduction */}
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-8 mb-4">1. Introduction</h2>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
            SST Home Solutions ("we", "us", "our", or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, mobile application, and other digital platforms (collectively, the "Platform").
          </p>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
            Please read this Privacy Policy carefully. If you do not agree with our privacy practices, please do not use our Platform. By accessing or using SST Home Solutions, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy.
          </p>

          {/* 2. Information We Collect */}
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-8 mb-4">2. Information We Collect</h2>
          
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mt-6 mb-3 flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-500" />
            Information You Provide Directly
          </h3>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
            We collect information you voluntarily provide when using our Platform, including:
          </p>
          <ul className="list-disc list-inside space-y-2 text-zinc-700 dark:text-zinc-300 mb-6">
            <li><strong>Account Information:</strong> Name, email address, phone number, password, profile picture, address, and user type (owner, tenant, admin)</li>
            <li><strong>Property Information:</strong> Property descriptions, photographs, videos, location, amenities, pricing, availability, and other listing details</li>
            <li><strong>Communication Data:</strong> Messages, inquiries, reviews, feedback, support requests, and other correspondence</li>
            <li><strong>Identity & Verification:</strong> Government-issued ID, address proof, ownership/tenancy documents, and other verification materials</li>
            <li><strong>Payment Information:</strong> Payment method details, transaction history, and billing information (processed securely through payment providers)</li>
            <li><strong>Survey Data:</strong> Responses to surveys, questionnaires, and feedback forms</li>
          </ul>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mt-6 mb-3 flex items-center gap-2">
            <Eye className="w-5 h-5 text-green-500" />
            Information Collected Automatically
          </h3>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
            We automatically collect certain information when you interact with our Platform:
          </p>
          <ul className="list-disc list-inside space-y-2 text-zinc-700 dark:text-zinc-300 mb-6">
            <li><strong>Device Information:</strong> Device type, operating system, browser type, IP address, device identifiers, and mobile network information</li>
            <li><strong>Usage Information:</strong> Pages viewed, links clicked, search queries, time spent on pages, referring/exit pages, and navigation actions</li>
            <li><strong>Location Information:</strong> Approximate location based on IP address or GPS (if enabled)</li>
            <li><strong>Cookies & Tracking:</strong> Cookies, web beacons, pixels, and similar tracking technologies to enhance your experience</li>
            <li><strong>Performance Data:</strong> Platform performance, error logs, crash reports, and system diagnostics</li>
          </ul>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mt-6 mb-3">Information from Third Parties</h3>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-6">
            We may receive information about you from third parties, including payment processors, identity verification services, analytics providers, and other Users of the Platform. We may also collect publicly available information from external sources to verify information or enhance our services.
          </p>

          {/* 3. How We Use Your Information */}
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-8 mb-4">3. How We Use Your Information</h2>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
            We use the information we collect for various purposes:
          </p>
          <ul className="list-disc list-inside space-y-2 text-zinc-700 dark:text-zinc-300 mb-6">
            <li>Operating and improving the Platform and our services</li>
            <li>Creating and managing user accounts</li>
            <li>Facilitating communication between Users</li>
            <li>Processing transactions and sending transaction-related communications</li>
            <li>Verifying user identity and preventing fraud</li>
            <li>Sending promotional emails, newsletters, and marketing communications (with your consent)</li>
            <li>Responding to user inquiries and providing customer support</li>
            <li>Conducting analytics and understanding how Users interact with our Platform</li>
            <li>Complying with legal obligations and enforcing our Terms & Conditions</li>
            <li>Personalizing user experience and recommendations</li>
            <li>Detecting, preventing, and addressing technical and security issues</li>
            <li>Protecting against fraud, abuse, and other harmful activities</li>
          </ul>

          {/* 4. How We Share Your Information */}
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-8 mb-4">4. How We Share Your Information</h2>
          
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mt-6 mb-3">With Other Users</h3>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-6">
            When you list a property or respond to inquiries, certain information (such as your name, profile picture, property details, and communication) may be visible to other Users depending on your privacy settings and the context of the interaction.
          </p>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mt-6 mb-3">With Service Providers</h3>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-6">
            We share information with third-party service providers who assist us in operating our Platform, including payment processors, email providers, analytics services, hosting providers, identity verification services, and customer support platforms. These service providers are contractually obligated to use your information only as necessary to provide services to us.
          </p>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mt-6 mb-3">With Legal Authority</h3>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-6">
            We may disclose information if required by law, court order, government request, or if we believe in good faith that disclosure is necessary to protect our rights, your safety, or the safety of others.
          </p>

          <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mt-6 mb-3">Business Transfers</h3>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-6">
            If SST Home Solutions is involved in a merger, acquisition, bankruptcy, or sale of assets, your information may be transferred as part of that transaction. We will provide notice before your personal information becomes subject to a different privacy policy.
          </p>

          {/* 5. Data Security */}
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-8 mb-4">5. Data Security</h2>
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 mb-6">
            <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure data centers, access controls, and regular security audits. However, no method of transmission over the internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
            </p>
          </div>

          {/* 6. Your Privacy Rights */}
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-8 mb-4">6. Your Privacy Rights</h2>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
            Depending on your location and applicable law, you may have the following rights:
          </p>
          <ul className="list-disc list-inside space-y-2 text-zinc-700 dark:text-zinc-300 mb-6">
            <li><strong>Right to Access:</strong> You have the right to request access to the personal information we hold about you</li>
            <li><strong>Right to Rectification:</strong> You can request correction of inaccurate or incomplete information</li>
            <li><strong>Right to Erasure:</strong> You may request deletion of your personal information (subject to legal obligations)</li>
            <li><strong>Right to Restrict Processing:</strong> You can request limitation of how we process your information</li>
            <li><strong>Right to Data Portability:</strong> You have the right to receive your data in a portable format</li>
            <li><strong>Right to Withdraw Consent:</strong> You can withdraw consent for marketing communications at any time</li>
            <li><strong>Right to Lodge a Complaint:</strong> You have the right to file a complaint with the relevant data protection authority</li>
          </ul>

          {/* 7. Cookies & Tracking Technologies */}
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-8 mb-4">7. Cookies & Tracking Technologies</h2>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
            Our Platform uses cookies and similar tracking technologies to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-zinc-700 dark:text-zinc-300 mb-6">
            <li>Remember your preferences and login information</li>
            <li>Understand how you interact with our Platform</li>
            <li>Measure the effectiveness of marketing campaigns</li>
            <li>Improve Platform functionality and user experience</li>
            <li>Detect and prevent fraud</li>
          </ul>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-6">
            Most browsers allow you to control cookies through their settings. You can decline cookies, but this may limit your ability to use certain features of our Platform.
          </p>

          {/* 8. Marketing Communications */}
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-8 mb-4">8. Marketing Communications</h2>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
            We may send you marketing emails, SMS, push notifications, and other promotional materials about our services. You can opt out of marketing communications at any time by:
          </p>
          <ul className="list-disc list-inside space-y-2 text-zinc-700 dark:text-zinc-300 mb-6">
            <li>Clicking the "Unsubscribe" link in marketing emails</li>
            <li>Adjusting your notification settings in your account</li>
            <li>Contacting us at the contact details provided below</li>
          </ul>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-6">
            Please note that opting out of marketing communications does not affect transactional emails such as order confirmations, account notifications, or support messages.
          </p>

          {/* 9. Children's Privacy */}
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-8 mb-4">9. Children's Privacy</h2>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-6">
            Our Platform is not intended for children under the age of 18. We do not knowingly collect personal information from children. If we become aware that a child has provided us with personal information, we will delete such information and terminate the child's account. If you believe we have collected information from a child, please contact us immediately.
          </p>

          {/* 10. Data Retention */}
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-8 mb-4">10. Data Retention</h2>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-6">
            We retain your personal information for as long as necessary to provide our services, fulfill the purposes outlined in this Privacy Policy, and comply with legal obligations. The retention period may vary depending on the type of information and the purpose of processing. When information is no longer needed, we securely delete or anonymize it. However, we may retain information for legal, regulatory, or business purposes for a longer period.
          </p>

          {/* 11. International Data Transfers */}
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-8 mb-4">11. International Data Transfers</h2>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-6">
            Your information may be transferred, stored, and processed in countries other than your country of residence. These countries may have data protection laws different from those in India. By using our Platform, you consent to the transfer of your information to countries outside your country of residence, which may not have the same level of data protection.
          </p>

          {/* 12. Third-Party Links */}
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-8 mb-4">12. Third-Party Links & Services</h2>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-6">
            Our Platform may contain links to third-party websites, applications, and services that are not operated by SST Home Solutions. This Privacy Policy does not apply to third-party services, and we are not responsible for their privacy practices. We encourage you to review the privacy policies of any third-party services before providing your personal information.
          </p>

          {/* 13. California Privacy Rights */}
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-8 mb-4">13. California Privacy Rights (CCPA)</h2>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
            If you are a California resident, you have certain rights under the California Consumer Privacy Act (CCPA):
          </p>
          <ul className="list-disc list-inside space-y-2 text-zinc-700 dark:text-zinc-300 mb-6">
            <li>Right to know what personal information we collect, use, and share</li>
            <li>Right to delete personal information collected from you</li>
            <li>Right to opt-out of the sale or sharing of personal information</li>
            <li>Right to non-discrimination for exercising your CCPA rights</li>
          </ul>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-6">
            To exercise these rights, please contact us using the details provided in the "Contact Us" section below.
          </p>

          {/* 14. European Privacy Rights */}
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-8 mb-4">14. European Privacy Rights (GDPR)</h2>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-6">
            If you are located in the European Union or European Economic Area, your personal information is protected under the General Data Protection Regulation (GDPR). You have the right to request access, rectification, erasure, and data portability. You also have the right to lodge a complaint with your local data protection authority if you believe your rights have been violated.
          </p>

          {/* 15. Changes to This Privacy Policy */}
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-8 mb-4">15. Changes to This Privacy Policy</h2>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-6">
            We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. We will notify you of material changes by posting the updated Privacy Policy on our Platform with an updated effective date. Your continued use of our Platform after changes become effective constitutes your acceptance of the updated Privacy Policy.
          </p>

          {/* 16. Contact Us */}
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-8 mb-4">16. Contact Us</h2>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
            If you have questions about this Privacy Policy, wish to exercise your privacy rights, or need to report a privacy concern, please contact us:
          </p>
          <div className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-lg space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
            <div>
              <p className="font-semibold text-zinc-900 dark:text-white">Company Name:</p>
              <p>SST Home Solutions</p>
            </div>
            <div>
              <p className="font-semibold text-zinc-900 dark:text-white">Email:</p>
              <p><Link href="mailto:privacy@ssthomesolutions.com" className="text-rose-600 dark:text-rose-400 hover:underline">privacy@ssthomesolutions.com</Link></p>
            </div>
            <div>
              <p className="font-semibold text-zinc-900 dark:text-white">Phone:</p>
              <p>9935246863</p>
            </div>
            <div>
              <p className="font-semibold text-zinc-900 dark:text-white">Registered Address:</p>
              <p>Village Kotar, Post Palpatti, Tehsil Meja, District Prayagraj, Uttar Pradesh – 212106, India</p>
            </div>
            <div>
              <p className="font-semibold text-zinc-900 dark:text-white">Data Protection Officer (DPO):</p>
              <p>Pushpraj Tiwari</p>
              <p>Email: <Link href="mailto:dpo@ssthomesolutions.com" className="text-rose-600 dark:text-rose-400 hover:underline">dpo@ssthomesolutions.com</Link></p>
            </div>
          </div>

          {/* Acknowledgment */}
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mt-8">
            <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed">
              By using SST Home Solutions, you acknowledge that you have read and understood this Privacy Policy and agree to our collection, use, and sharing of your personal information as described herein. Your trust is important to us, and we are committed to being transparent about how we handle your data.
            </p>
          </div>

          <p className="text-center text-zinc-500 dark:text-zinc-500 mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-800">
            © {new Date().getFullYear()} SST Home Solutions. All rights reserved.
          </p>
        </motion.div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-lg transition-colors z-50"
        >
          <ArrowUp className="w-5 h-5" />
        </motion.button>
      )}
    </div>
  );
}
