"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, IndianRupee, Shield, BarChart2 } from "lucide-react";

const PERKS = [
  { icon: <IndianRupee className="w-5 h-5" />, label: "Earn steady income",   grad: "from-amber-500 to-orange-400" },
  { icon: <Shield      className="w-5 h-5" />, label: "Verified tenants only", grad: "from-blue-500 to-cyan-400"   },
  { icon: <BarChart2   className="w-5 h-5" />, label: "Analytics dashboard",   grad: "from-purple-500 to-violet-400" },
];

export default function OwnerCTAStrip() {
  return (
    <section className="py-14 px-4 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 relative overflow-hidden">
      {/* subtle dot grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px,rgba(255,255,255,0.08) 1px,transparent 0)", backgroundSize: "28px 28px" }}
      />
      <div className="max-w-6xl mx-auto relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Left copy */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center lg:text-left"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 text-xs font-semibold mb-3 uppercase tracking-widest">
            For Property Owners
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            List Free. Earn Every Month.
          </h2>
          <p className="text-white/55 text-sm mt-2 max-w-md">
            Join 5,000+ owners across UP who trust Nestora to find verified tenants fast.
          </p>
        </motion.div>

        {/* Perks */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-3"
        >
          {PERKS.map((p, i) => (
            <div
              key={i}
              className="flex items-center gap-2 bg-white/8 border border-white/12 rounded-full px-4 py-2 text-sm text-white/80 font-medium backdrop-blur-sm"
            >
              <span className={`w-7 h-7 rounded-full bg-gradient-to-br ${p.grad} flex items-center justify-center text-white flex-shrink-0`}>
                {p.icon}
              </span>
              {p.label}
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="flex-shrink-0"
        >
          <Link href="/auth/register">
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-amber-400 text-white font-bold px-6 py-3 rounded-2xl shadow-xl shadow-rose-500/30 hover:shadow-rose-500/50 transition-shadow text-sm"
            >
              Start Listing — Free
              <ArrowRight className="w-4 h-4" />
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
