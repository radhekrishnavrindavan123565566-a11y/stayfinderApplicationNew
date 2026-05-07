"use client";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Home, ArrowRight } from "lucide-react";

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

const EXPLORE = [
  { label: "Properties", href: "/properties" },
  { label: "Roommates", href: "/roommates" },
  { label: "Become a Host", href: "/auth/register" },
  { label: "Compare", href: "/compare" },
];
const SUPPORT = [
  { label: "Help Center", href: "/contact" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "Terms & Conditions", href: "/terms" },
];

// Simple SVG social icons to avoid deprecated lucide icons
function TwitterIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}
function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

const SOCIALS = [
  { Icon: TwitterIcon, label: "Twitter", href: "https://twitter.com" },
  { Icon: InstagramIcon, label: "Instagram", href: "https://instagram.com" },
  { Icon: FacebookIcon, label: "Facebook", href: "https://facebook.com" },
];

export default function Footer() {
  return (
    <footer className="bg-zinc-900 dark:bg-zinc-950 text-zinc-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10"
        >
          {/* Brand — full width on mobile, 2 cols on lg */}
          <motion.div variants={fadeUp} className="sm:col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 group w-fit">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-amber-600 flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="font-bold text-lg text-white group-hover:text-amber-400 transition-colors">
                Stay<span className="text-amber-400">erra</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs mb-5 text-zinc-400">
              Modern Living, Grounded Search. Verified PGs, rooms &amp; flats across Uttar Pradesh.
            </p>
            <div className="flex gap-3">
              {SOCIALS.map(({ Icon, label, href }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.12, backgroundColor: "#f43f5e" }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center cursor-pointer transition-colors text-zinc-400 hover:text-white"
                  aria-label={label}
                >
                  <Icon />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Explore */}
          <motion.div variants={fadeUp}>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wide">Explore</h4>
            <ul className="space-y-3 text-sm">
              {EXPLORE.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="hover:text-white transition-colors flex items-center gap-1.5 group py-0.5">
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 flex-shrink-0" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Support */}
          <motion.div variants={fadeUp}>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wide">Support</h4>
            <ul className="space-y-3 text-sm">
              {SUPPORT.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="hover:text-white transition-colors flex items-center gap-1.5 group py-0.5">
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 flex-shrink-0" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="border-t border-zinc-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-zinc-500"
        >
          <p suppressHydrationWarning>© {new Date().getFullYear()} Stayerra. All rights reserved.</p>
          <div className="flex gap-4 sm:gap-6">
            <Link href="/terms" className="hover:text-white transition-colors py-1">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors py-1">Terms</Link>
            <Link href="/contact" className="hover:text-white transition-colors py-1">Contact</Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
