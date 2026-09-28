'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, Check } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
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
            Terms & Conditions
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
            These Terms & Conditions ("Terms", "Terms & Conditions", or "Agreement") govern access to and use of the website, mobile application, digital platform, communication channels, and related services operated by SST Home Solutions ("SST Home Solutions", "Company", "we", "us", or "our").
          </p>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
            SST Home Solutions operates as a property-rental listing and mediation platform intended to facilitate connections between property owners, landlords, tenants, prospective tenants, and other property users. The platform may also facilitate property-related enquiries involving buyers and sellers where such functionality is made available.
          </p>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
            By accessing, registering with, browsing, listing a property on, communicating through, or otherwise using the platform, you agree to be legally bound by these Terms and the policies incorporated into them. If you do not agree with these Terms, you must not use the platform.
          </p>

          {/* 2. Definitions */}
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-8 mb-4">2. Definitions</h2>
          <div className="space-y-3 mb-6">
            {[
              { term: 'Platform', def: 'The SST Home Solutions website, mobile application, software, digital services, communication interfaces, and other online services operated or made available by the Company.' },
              { term: 'User', def: 'Any person who accesses or uses the Platform.' },
              { term: 'Property Owner', def: 'The owner of a property or a person who has lawful authority or written authorization to list, rent, lease, manage, or otherwise offer the property.' },
              { term: 'Tenant', def: 'A person seeking to rent, lease, occupy, or use a property.' },
              { term: 'Listing', def: 'Any property advertisement, description, photograph, video, document, price, location, amenity, availability information, or other information submitted to the Platform.' },
              { term: 'Services', def: 'The listing, search, enquiry, communication, property-matching, mediation, brokerage, support, and other services provided by SST Home Solutions.' },
              { term: 'User Content', def: 'Information, photographs, videos, documents, reviews, descriptions, messages, comments, or other material submitted or uploaded by a User.' },
              { term: 'Service Fee', def: 'Any fee payable to SST Home Solutions for a service provided by the Company.' },
              { term: 'Brokerage', def: 'Any brokerage or mediation fee payable to SST Home Solutions where applicable.' },
            ].map((item, idx) => (
              <div key={idx} className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg">
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">{item.term}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">{item.def}</p>
              </div>
            ))}
          </div>

          {/* 3. About SST Home Solutions */}
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-8 mb-4">3. About SST Home Solutions</h2>
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
              <Check className="w-5 h-5 text-amber-600" />
              Platform Role
            </h3>
            <p className="text-zinc-700 dark:text-zinc-300 text-sm">
              SST Home Solutions is primarily a digital property listing and mediation platform. The Company may facilitate communication and introductions between Users but does not become a party to any rental, lease, sale, purchase, security-deposit, maintenance, or other private agreement between Users unless expressly agreed in writing.
            </p>
          </div>

          <h3 className="font-semibold text-zinc-900 dark:text-white mb-3 text-lg">No Ownership of Listed Properties</h3>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-6">
            SST Home Solutions does not ordinarily own the properties listed on the Platform. The Company is not the landlord, tenant, buyer, seller, owner, builder, developer, or legal representative of a property merely because that property appears on the Platform.
          </p>

          <h3 className="font-semibold text-zinc-900 dark:text-white mb-3 text-lg">No Guarantee</h3>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
            SST Home Solutions does not guarantee:
          </p>
          <ul className="list-disc list-inside space-y-2 text-zinc-700 dark:text-zinc-300 mb-6">
            <li>Ownership of a listed property</li>
            <li>Accuracy of property information</li>
            <li>Availability of a property</li>
            <li>Legal title</li>
            <li>Property condition</li>
            <li>Construction quality</li>
            <li>Government approvals</li>
            <li>Absence of encumbrances</li>
            <li>Accuracy of photographs or videos</li>
            <li>Identity or conduct of another User</li>
            <li>Completion of a transaction</li>
            <li>Suitability of a property for a particular User</li>
          </ul>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
            Users must conduct their own independent due diligence.
          </p>

          {/* 4. Eligibility */}
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-8 mb-4">4. Eligibility</h2>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
            You may use the Platform only if you are legally competent to enter into a binding agreement under applicable Indian law. Users must provide accurate, current, and complete information.
          </p>

          {/* 5. Account Registration */}
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-8 mb-4">5. Account Registration</h2>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
            Certain Platform features may require registration. Users may be required to provide information such as name, mobile number, email address, address, user type, property information, identification information where reasonably required, and other information necessary to provide the Services.
          </p>

          {/* User Responsibilities */}
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-8 mb-4">6. User Responsibilities</h2>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
            Every User agrees to:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-zinc-700 dark:text-zinc-300 mb-6">
            <li>Provide truthful information</li>
            <li>Use the Platform lawfully</li>
            <li>Respect other Users</li>
            <li>Avoid fraudulent conduct</li>
            <li>Avoid harassment or threats</li>
            <li>Not upload unauthorized documents or images</li>
            <li>Not impersonate another person</li>
            <li>Not misuse another User's personal information</li>
            <li>Not interfere with Platform operations</li>
            <li>Not attempt to bypass security measures</li>
            <li>Not use the Platform for unlawful purposes</li>
            <li>Independently verify important information before entering into a transaction</li>
          </ol>

          {/* Payment & Refund Policy */}
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-8 mb-4">7. Payment & Refund Policy</h2>
          <h3 className="font-semibold text-zinc-900 dark:text-white mb-3 text-lg">Payment Methods</h3>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-6">
            Payments may be processed through payment methods or payment service providers made available by SST Home Solutions. Payment processing may be subject to the terms and policies of the applicable payment provider. Applicable taxes, including GST where legally applicable, may be charged in addition to stated fees.
          </p>

          <h3 className="font-semibold text-zinc-900 dark:text-white mb-3 text-lg">Refund Policy</h3>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
            Unless otherwise stated for a particular service or required by applicable law, fees relating to services that have already been substantially performed may be non-refundable. The Company may consider refunds for duplicate payments, demonstrable accidental overpayments, payments collected in error, or other circumstances where a refund is required by applicable law.
          </p>

          {/* Privacy */}
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-8 mb-4">8. Privacy & Personal Data</h2>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
            SST Home Solutions may collect and process personal information necessary to operate the Platform and provide the Services. Personal information will be handled in accordance with the Company's Privacy Policy and applicable law. For detailed information, please refer to our <Link href="/privacy" className="text-rose-600 dark:text-rose-400 font-semibold hover:underline">Privacy Policy</Link>.
          </p>

          {/* Prohibited Content */}
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-8 mb-4">9. Prohibited Content & Activities</h2>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
            Users must not upload, publish, transmit, or otherwise use the Platform for content or activity that is unlawful, fraudulent, deceptive, threatening, abusive, defamatory, invasive of privacy, infringing of intellectual property, or otherwise prohibited by applicable law. This includes:
          </p>
          <ul className="list-disc list-inside space-y-1 text-zinc-700 dark:text-zinc-300 mb-6">
            <li>Fake Listings and fake identities</li>
            <li>Unauthorized property Listings</li>
            <li>Stolen photographs</li>
            <li>Malware or malicious code</li>
            <li>Spam, harassment, and threats</li>
            <li>Impersonation and fraudulent payment requests</li>
            <li>Illegal activities</li>
            <li>Any activity prohibited by applicable law</li>
          </ul>

          {/* Intellectual Property */}
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-8 mb-4">10. Intellectual Property Rights</h2>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
            Unless otherwise stated, the Platform, including its software, design, branding, logos, text, graphics, databases, layout, and other original materials, belongs to SST Home Solutions or its respective licensors. Users must not reproduce, copy, modify, distribute, sell, reverse engineer, or commercially exploit Company intellectual property without prior written authorization, except where permitted by law.
          </p>

          {/* Limitation of Liability */}
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-8 mb-4">11. Limitation of Liability</h2>
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-6">
            <p className="text-zinc-700 dark:text-zinc-300 text-sm">
              To the maximum extent permitted by applicable law, SST Home Solutions will not be responsible for losses arising directly or indirectly from incorrect User information, false property Listings, ownership disputes, property condition, rental disputes, security deposit disputes, private agreements between Users, fraud committed by Users or third parties, service interruptions, or third-party services.
            </p>
          </div>

          {/* Account Suspension */}
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-8 mb-4">12. Account Suspension & Termination</h2>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
            SST Home Solutions may suspend, restrict, or terminate an account or Listing where reasonably necessary because of violation of these Terms, fraud, false information, illegal activity, repeated complaints, safety concerns, security concerns, intellectual property infringement, non-payment of applicable Company fees, or legal or regulatory requirements.
          </p>

          {/* Grievance Redressal */}
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-8 mb-4">13. Grievance Redressal</h2>
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-zinc-900 dark:text-white mb-3">Grievance Officer</h3>
            <div className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
              <p><span className="font-semibold">Name:</span> Pushpraj Tiwari</p>
              <p><span className="font-semibold">Designation:</span> Grievance Officer / Proprietor</p>
              <p><span className="font-semibold">Mobile:</span> 9935246863</p>
              <p><span className="font-semibold">Email:</span> pushprajtiwari012@gmail.com</p>
              <p><span className="font-semibold">Office:</span> Village Kotar, Post Palpatti, Tehsil Meja, District Prayagraj, Uttar Pradesh – 212106, India</p>
            </div>
          </div>

          {/* Governing Law */}
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-8 mb-4">14. Governing Law & Jurisdiction</h2>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
            These Terms shall be governed by and interpreted in accordance with the laws of India. Subject to any mandatory jurisdiction or dispute-resolution rights available under applicable law, disputes arising from or relating to these Terms or use of the Platform shall be subject to the jurisdiction of the competent courts at Prayagraj, Uttar Pradesh, India.
          </p>

          {/* Changes to Terms */}
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-8 mb-4">15. Changes to These Terms</h2>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-6">
            SST Home Solutions may modify these Terms from time to time. The updated version will be published through the Platform with an updated effective or revision date. Continued use of the Platform after the effective date of updated Terms may constitute acceptance to the extent permitted by law.
          </p>

          {/* Acceptance */}
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-8 mb-4">16. Acceptance of Terms</h2>
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed">
              By accessing, registering with, browsing, listing a property on, or using SST Home Solutions, you confirm that you have read and understood these Terms, agree to comply with them, and understand that SST Home Solutions primarily operates as a digital property listing and mediation platform. You also agree to our Privacy Policy and other applicable Platform policies.
            </p>
          </div>

          {/* Contact */}
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-8 mb-4">17. Contact Details</h2>
          <div className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-lg">
            <div className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
              <p><span className="font-semibold">Company:</span> SST Home Solutions</p>
              <p><span className="font-semibold">Website:</span> <Link href="https://ssthomesolutions.com" className="text-rose-600 dark:text-rose-400 hover:underline">www.ssthomesolutions.com</Link></p>
              <p><span className="font-semibold">Email:</span> <Link href="mailto:info@ssthomesolutions.com" className="text-rose-600 dark:text-rose-400 hover:underline">info@ssthomesolutions.com</Link></p>
              <p><span className="font-semibold">Registered Office:</span> Village Kotar, Post Palpatti, Tehsil Meja, District Prayagraj, Uttar Pradesh – 212106, India</p>
            </div>
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
