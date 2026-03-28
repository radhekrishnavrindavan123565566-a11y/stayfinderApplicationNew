"use client";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Home, Twitter, Instagram, Facebook, ArrowRight } from "lucide-react";

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const EXPLORE = [
  { label: "Properties", href: "/properties" },
  { label: "Cities", href: "/properties" },
  { label: "Experiences", href: "/properties" },
  { label: "Become a Host", href: "/auth/register" },
];
const SUPPORT = [
  { label: "Help Center", href: "/contact" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "Terms & Conditions", href: "/terms" },
];
const SOCIALS = [
  { Icon: Twitter, label: "Twitter" },
  { Icon: Instagram, label: "Instagram" },
  { Icon: Facebook, label: "Facebook" },
];

export default function Footer() {
  return (
    <footer className="bg-zinc-900 dark:bg-zinc-950 text-zinc-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-10"
        >
          {/* Brand */}
          <motion.div variants={fadeUp} className="col-span-2 sm:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 group w-fit">
              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                className="w-8 h-8 bg-rose-500 rounded-xl flex items-center justify-center"
              >
                <Home className="w-4 h-4 text-white" />
              </motion.div>
              <span className="font-bold text-lg text-white group-hover:text-rose-400 transition-colors">
                StayFinder
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs mb-5">
              Find your perfect stay. Browse thousands of unique properties around the world.
            </p>
            <div className="flex gap-3">
              {SOCIALS.map(({ Icon, label }) => (
                <motion.span
                  key={label}
                  whileHover={{ scale: 1.15, backgroundColor: "#f43f5e" }}
                  whileTap={{ scale: 0.95 }}
                  className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center cursor-pointer transition-colors"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4" />
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Explore */}
          <motion.div variants={fadeUp}>
            <h4 className="text-white font-semibold mb-4 text-sm">Explore</h4>
            <ul className="space-y-2.5 text-sm">
              {EXPLORE.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="hover:text-white transition-colors flex items-center gap-1 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Support */}
          <motion.div variants={fadeUp}>
            <h4 className="text-white font-semibold mb-4 text-sm">Support</h4>
            <ul className="space-y-2.5 text-sm">
              {SUPPORT.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="hover:text-white transition-colors flex items-center gap-1 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
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
          className="border-t border-zinc-800 mt-10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs"
        >
          <p>© {new Date().getFullYear()} StayFinder. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
