"use client";
import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Home, Users, Star, Shield, Zap, Heart, Globe, TrendingUp,
  Award, Sparkles, ArrowRight, CheckCircle,
} from "lucide-react";
import Button from "@/components/ui/Button";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: "easeOut" },
  }),
};
const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } };

const STATS = [
  { value: "10K+", label: "Properties Listed", icon: <Home className="w-5 h-5" />, color: "text-rose-500" },
  { value: "50K+", label: "Happy Guests", icon: <Users className="w-5 h-5" />, color: "text-blue-500" },
  { value: "120+", label: "Cities Covered", icon: <Globe className="w-5 h-5" />, color: "text-green-500" },
  { value: "4.9★", label: "Average Rating", icon: <Star className="w-5 h-5" />, color: "text-amber-500" },
];

const VALUES = [
  { icon: <Shield className="w-6 h-6" />, title: "Trust & Safety", desc: "Every property is verified. Every owner is screened. Your safety is our top priority.", color: "bg-blue-50 dark:bg-blue-950/30 text-blue-500" },
  { icon: <Heart className="w-6 h-6" />, title: "Guest First", desc: "We obsess over the guest experience — from search to check-out and everything in between.", color: "bg-rose-50 dark:bg-rose-950/30 text-rose-500" },
  { icon: <Zap className="w-6 h-6" />, title: "Innovation", desc: "AI-powered search, smart pricing, and real-time insights keep us ahead of the curve.", color: "bg-amber-50 dark:bg-amber-950/30 text-amber-500" },
  { icon: <Globe className="w-6 h-6" />, title: "Global Reach", desc: "From cozy studios to luxury villas — we connect people with homes in 120+ cities worldwide.", color: "bg-green-50 dark:bg-green-950/30 text-green-500" },
  { icon: <TrendingUp className="w-6 h-6" />, title: "Owner Success", desc: "We give property owners the tools, analytics, and support to maximize their earnings.", color: "bg-purple-50 dark:bg-purple-950/30 text-purple-500" },
  { icon: <Sparkles className="w-6 h-6" />, title: "Transparency", desc: "No hidden fees. No surprises. Clear pricing and honest communication at every step.", color: "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500" },
];

const TEAM = [
  { name: "Alex Rivera", role: "CEO & Co-Founder", emoji: "👨‍💼", bg: "from-rose-400 to-rose-600" },
  { name: "Priya Sharma", role: "CTO & Co-Founder", emoji: "👩‍💻", bg: "from-blue-400 to-blue-600" },
  { name: "Marcus Chen", role: "Head of Design", emoji: "🎨", bg: "from-purple-400 to-purple-600" },
  { name: "Sofia Müller", role: "Head of Growth", emoji: "📈", bg: "from-green-400 to-green-600" },
];

const MILESTONES = [
  { year: "2024", title: "Founded", desc: "Stayerra was born in Prayagraj with a mission to simplify room rentals across UP." },
  { year: "2025", title: "1,000 Properties", desc: "Reached our first major milestone with listings across 10 cities in Uttar Pradesh." },
  { year: "2025", title: "AI Launch", desc: "Launched AI-powered search and smart pricing recommendations." },
  { year: "2026", title: "50K Users", desc: "Crossed 50,000 users and expanded to all major UP cities." },
  { year: "2026", title: "Series A", desc: "Raised funding to accelerate growth and build new features." },
];

export default function AboutPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 overflow-x-hidden">

      {/* ── Hero ── */}
      <section ref={heroRef} className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1920&q=80"
            alt="About Stayerra"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
        </motion.div>

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 14 }).map((_, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -30, 0], opacity: [0, 0.5, 0] }}
              transition={{ duration: 4 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
              className="absolute w-1.5 h-1.5 bg-white/30 rounded-full"
              style={{ left: `${(i * 7.3) % 100}%`, top: `${(i * 9.1) % 100}%` }}
            />
          ))}
        </div>

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium px-4 py-1.5 rounded-full mb-6"
          >
            <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>
              <Home className="w-4 h-4" />
            </motion.span>
            Our Story
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7, ease: "easeOut" }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
          >
            We&apos;re on a mission to make
            <br />
            <span className="text-rose-400">renting feel like home</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-lg text-white/80 max-w-2xl mx-auto"
          >
            Stayerra connects people with the right rooms and PGs — and helps property owners build thriving rental businesses across Uttar Pradesh.
          </motion.p>
        </motion.div>
      </section>

      {/* ── Stats ── */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              custom={i}
              variants={fadeUp}
              whileHover={{ y: -5, boxShadow: "0 16px 40px rgba(0,0,0,0.1)" }}
              className="bg-white dark:bg-zinc-900 rounded-2xl p-5 sm:p-6 border border-zinc-100 dark:border-zinc-800 shadow-sm text-center transition-shadow"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 + i * 0.5 }}
                className={`inline-flex mb-3 ${s.color}`}
              >
                {s.icon}
              </motion.div>
              <div className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">{s.value}</div>
              <div className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Mission ── */}
      <section className="py-16 sm:py-20 px-4 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 bg-rose-50 dark:bg-rose-950/30 text-rose-500 text-sm font-medium px-3 py-1.5 rounded-full mb-5">
                <Award className="w-4 h-4" /> Our Mission
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mb-5 leading-tight">
                Making great stays accessible to everyone
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6">
                We started Stayerra because we believed finding a great room or PG in UP shouldn&apos;t be stressful or full of surprises. We built a platform where trust is built in — verified listings, transparent pricing, and real reviews from real tenants.
              </p>
              <div className="space-y-3">
                {[
                  "Verified properties with quality guarantees",
                  "AI-powered matching for perfect stays",
                  "Secure payments with escrow protection",
                  "24/7 support for guests and owners",
                ].map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 + i * 0.3 }}
                    >
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    </motion.div>
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative"
            >
              <div className="relative h-72 sm:h-96 rounded-3xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80"
                  alt="Beautiful rental property"
                  fill
                  className="object-cover"
                />
              </div>
              {/* Floating badge */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-4 -left-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-4 border border-zinc-100 dark:border-zinc-800"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-100 dark:bg-rose-950/30 rounded-xl flex items-center justify-center">
                    <Star className="w-5 h-5 text-rose-500 fill-rose-500" />
                  </div>
                  <div>
                    <p className="font-bold text-zinc-900 dark:text-white text-sm">4.9 / 5.0</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">50K+ reviews</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="py-16 sm:py-20 px-4 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mb-3">What we stand for</h2>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">Our values guide every decision we make — from product features to customer support.</p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
        >
          {VALUES.map((v, i) => (
            <motion.div
              key={v.title}
              custom={i}
              variants={fadeUp}
              whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.08)" }}
              className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-800 shadow-sm transition-shadow"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 + i * 0.4 }}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${v.color}`}
              >
                {v.icon}
              </motion.div>
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">{v.title}</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Timeline ── */}
      <section className="py-16 sm:py-20 px-4 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mb-3">Our journey</h2>
            <p className="text-zinc-500 dark:text-zinc-400">From a small idea to a global platform.</p>
          </motion.div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 sm:left-1/2 top-0 bottom-0 w-px bg-zinc-200 dark:bg-zinc-800 -translate-x-1/2" />

            <div className="space-y-8">
              {MILESTONES.map((m, i) => (
                <motion.div
                  key={m.year}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className={`relative flex items-start gap-6 sm:gap-0 ${i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"}`}
                >
                  {/* Dot */}
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: i * 0.5 }}
                    className="absolute left-6 sm:left-1/2 -translate-x-1/2 w-4 h-4 bg-rose-500 rounded-full border-4 border-white dark:border-zinc-950 z-10 mt-1"
                  />

                  {/* Content */}
                  <div className={`ml-14 sm:ml-0 sm:w-[calc(50%-2rem)] ${i % 2 === 0 ? "sm:pr-8 sm:text-right" : "sm:pl-8"}`}>
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800 shadow-sm">
                      <span className="text-xs font-bold text-rose-500 uppercase tracking-wide">{m.year}</span>
                      <h3 className="font-semibold text-zinc-900 dark:text-white mt-1">{m.title}</h3>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{m.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="py-16 sm:py-20 px-4 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mb-3">Meet the team</h2>
            <p className="text-zinc-500 dark:text-zinc-400">The people behind Stayerra.</p>
          </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6"
        >
          {TEAM.map((member, i) => (
            <motion.div
              key={member.name}
              custom={i}
              variants={fadeUp}
              whileHover={{ y: -6 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-100 dark:border-zinc-800 shadow-sm text-center"
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${member.bg} flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg`}
              >
                {member.emoji}
              </motion.div>
              <p className="font-semibold text-zinc-900 dark:text-white text-sm">{member.name}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{member.role}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 sm:py-24 px-4 bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          {[{ w: 400, x: -5, y: -5 }, { w: 300, x: 65, y: 55 }].map((orb, i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.18, 0.08] }}
              transition={{ duration: 6 + i * 2, repeat: Infinity }}
              className="absolute rounded-full bg-white"
              style={{ width: orb.w, height: orb.w, left: `${orb.x}%`, top: `${orb.y}%` }}
            />
          ))}
        </div>
        <div className="relative max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}>
              <Sparkles className="w-10 h-10 text-white/80 mx-auto mb-5" />
            </motion.div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to find your perfect stay?</h2>
            <p className="text-white/80 text-lg mb-8">Join 50,000+ users who trust Stayerra for their housing needs.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/properties">
                <Button size="lg" className="w-full sm:w-auto bg-white text-rose-500 hover:bg-zinc-50 shadow-xl">
                  Explore Properties <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10">
                  Contact Us
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
