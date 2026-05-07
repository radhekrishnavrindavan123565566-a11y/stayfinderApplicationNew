"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  motion, useTransform, AnimatePresence,
  useMotionValue, useSpring, type Variants,
} from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, Star, Shield, Clock, MapPin, Sparkles,
  TrendingUp, Key, Home, Building2,
  CheckCircle, Quote, ChevronLeft, ChevronRight,
} from "lucide-react";
import SearchBar from "@/components/property/SearchBar";
import PropertyCard from "@/components/property/PropertyCard";
import { usePropertyStore, Property } from "@/store/propertyStore";
import { useAuthStore } from "@/store/authStore";
import Button from "@/components/ui/Button";
import { SkeletonGrid } from "@/components/ui/SkeletonCard";
import axios from "axios";
import LiveActivityTicker from "@/components/home/LiveActivityTicker";
import RecentlyViewed from "@/components/home/RecentlyViewed";
import OwnerCTAStrip from "@/components/home/OwnerCTAStrip";

/* ─── data ──────────────────────────────────────────────────────────────── */
const CATEGORIES = [
  { label: "Apartments", icon: <Building2 className="w-6 h-6" />, type: "apartment", grad: "from-blue-500 to-cyan-400"     },
  { label: "Houses",     icon: <Home      className="w-6 h-6" />, type: "house",     grad: "from-rose-500 to-pink-400"     },
  { label: "PG / Rooms", icon: <Key       className="w-6 h-6" />, type: "condo",     grad: "from-indigo-500 to-blue-400"   },
];

const STATS = [
  { value: 10000, display: "10K+", label: "Properties",    icon: "🏠" },
  { value: 50000, display: "50K+", label: "Happy Tenants", icon: "😊" },
  { value: 120,   display: "120+", label: "UP Cities",     icon: "📍" },
  { value: 4.9,   display: "4.9★", label: "Avg Rating",    icon: "⭐" },
];

const WHY_US = [
  { icon: <Shield     className="w-7 h-7" />, title: "Verified Listings", desc: "Aadhaar-verified owners. Every listing checked before going live.", grad: "from-blue-600 to-cyan-500",     check: "Aadhaar verified" },
  { icon: <Star       className="w-7 h-7" />, title: "Top Rated Stays",   desc: "Real reviews from real tenants — no fake ratings.",               grad: "from-amber-500 to-orange-400",  check: "Genuine reviews" },
  { icon: <Clock      className="w-7 h-7" />, title: "Instant Booking",   desc: "Book your room in minutes, move in the same day.",                 grad: "from-green-500 to-emerald-400", check: "Same-day move-in" },
  { icon: <TrendingUp className="w-7 h-7" />, title: "Fair Pricing",      desc: "AI-powered price intelligence keeps rents transparent.",           grad: "from-purple-600 to-violet-400", check: "No hidden fees" },
  { icon: <MapPin     className="w-7 h-7" />, title: "Prime Locations",   desc: "Rooms near colleges, offices & transport hubs across UP.",         grad: "from-rose-500 to-pink-400",     check: "Near transit" },
  { icon: <Sparkles   className="w-7 h-7" />, title: "AI Match",          desc: "Smart suggestions based on your budget and preferences.",          grad: "from-indigo-500 to-blue-400",   check: "Personalised" },
];

const CITY_CARDS = [
  { city: "Prayagraj", img: "https://images.unsplash.com/photo-1609766418204-94aae0ecfdfc?w=600&q=80", count: "1.2K+" },
  { city: "Lucknow",   img: "https://images.unsplash.com/photo-1548013146-72479768bada?w=600&q=80",    count: "2.4K+" },
  { city: "Kanpur",    img: "https://images.unsplash.com/photo-1596436889106-be35e843f974?w=600&q=80", count: "980+"  },
  { city: "Varanasi",  img: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&q=80",    count: "760+"  },
];

const HERO_SLIDES = [
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1920&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1920&q=80",
];

const TESTIMONIALS = [
  { name: "Priya Sharma",   role: "Student, Lucknow",    avatar: "PS", text: "Found my PG in 10 minutes! The verified badge gave me confidence. Best platform for students.", rating: 5, color: "from-rose-400 to-pink-500"    },
  { name: "Rahul Verma",    role: "IT Professional, Noida", avatar: "RV", text: "Moved to a new city and Stayerra made finding a flat so easy. Transparent pricing, no broker fees.", rating: 5, color: "from-blue-400 to-indigo-500"  },
  { name: "Anjali Singh",   role: "Owner, Prayagraj",    avatar: "AS", text: "Listed my property and got 3 tenants in a week. The AI matching is genuinely impressive.", rating: 5, color: "from-amber-400 to-orange-500"  },
  { name: "Vikram Mishra",  role: "Teacher, Varanasi",   avatar: "VM", text: "The police verification reminder saved me from a lot of legal hassle. Very thoughtful platform.", rating: 5, color: "from-green-400 to-emerald-500" },
];

const PROCESS_STEPS = [
  { step: "01", title: "Search",   desc: "Filter by city, budget, type and amenities.",  icon: "🔍", color: "from-blue-500 to-cyan-400"    },
  { step: "02", title: "Explore",  desc: "View verified photos, 3D tours and reviews.",  icon: "🏠", color: "from-purple-500 to-violet-400" },
  { step: "03", title: "Connect",  desc: "Chat directly with the owner — no middlemen.", icon: "💬", color: "from-rose-500 to-pink-400"     },
  { step: "04", title: "Move In",  desc: "Sign digitally and move in the same day.",     icon: "🎉", color: "from-green-500 to-emerald-400" },
];

const POPULAR_SEARCHES = [
  { label: "PG under ₹5K · Prayagraj", city: "Prayagraj", type: "condo"     },
  { label: "1BHK · Lucknow",           city: "Lucknow",   type: "apartment" },
  { label: "Rooms near IIT · Kanpur",  city: "Kanpur",    type: "condo"     },
  { label: "Studio · Varanasi",        city: "Varanasi",  type: "apartment" },
];

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp: Variants  = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } } };

/* ─── reusable components ───────────────────────────────────────────────── */
// TiltCard: only active on pointer devices — saves 6 motion hooks per card on touch/mobile
function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0); const y = useMotionValue(0);
  const rx = useSpring(useTransform(y, [-60, 60], [8, -8]), { stiffness: 150, damping: 25 });
  const ry = useSpring(useTransform(x, [-60, 60], [-8, 8]), { stiffness: 150, damping: 25 });
  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    x.set(e.clientX - r.left - r.width / 2);
    y.set(e.clientY - r.top - r.height / 2);
  };
  return (
    <motion.div ref={ref} style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
      onMouseMove={onMove} onMouseLeave={() => { x.set(0); y.set(0); }} className={className}>
      {children}
    </motion.div>
  );
}

function Orb({ size, x, y, color, delay }: { size: number; x: string; y: string; color: string; delay: number }) {
  return (
    <div
      className={`absolute rounded-full blur-3xl pointer-events-none ${color}`}
      style={{ width: size, height: size, left: x, top: y }}
    />
  );
}

function CountUp({ display }: { display: string }) {
  const [show, setShow] = useState(false);
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  // Parse numeric part and suffix from display string like "10K+", "4.9★", "120+"
  const match = display.match(/^([\d.]+)(.*)$/);
  const numericTarget = match ? parseFloat(match[1]) : 0;
  const suffix = match ? match[2] : "";
  const isDecimal = numericTarget % 1 !== 0;

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      setShow(true);
      const duration = 1600;
      const steps = 50;
      const increment = numericTarget / steps;
      let current = 0;
      const t = setInterval(() => {
        current += increment;
        if (current >= numericTarget) { setCount(numericTarget); clearInterval(t); }
        else setCount(isDecimal ? Math.round(current * 10) / 10 : Math.floor(current));
      }, duration / steps);
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [numericTarget, isDecimal]);

  return <span ref={ref}>{show ? count : 0}{suffix}</span>;
}

function RecommendationsSection() {
  const { user, accessToken } = useAuthStore();
  const [recs, setRecs] = useState<Property[]>([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (!user || loaded) return;
    axios.get("/api/recommendations?limit=4", { headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {} })
      .then(({ data }) => { setRecs(data.data.recommendations); setLoaded(true); }).catch(() => {});
  }, [user, accessToken, loaded]);
  if (!user || recs.length === 0) return null;
  return (
    <section className="py-16 px-4 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Recommended for You</h2>
          <p className="text-sm text-zinc-500">Based on your booking history</p>
        </div>
      </motion.div>
      <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recs.map((p, i) => <motion.div key={p._id} variants={fadeUp}><PropertyCard property={p} index={i} /></motion.div>)}
      </motion.div>
    </section>
  );
}

export default function HomePage() {
  const { properties, isLoading, fetchProperties, setFilters } = usePropertyStore();
  const { _hasHydrated } = useAuthStore();
  const [slide, setSlide] = useState(0);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  // Fetch once on mount (works for unauthenticated users immediately)
  useEffect(() => { fetchProperties(1); }, [fetchProperties]);

  // Re-fetch after auth hydrates so excludeBooked is applied correctly for tenants
  useEffect(() => {
    if (_hasHydrated) fetchProperties(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_hasHydrated]);
  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const handleCategory = useCallback((type: string) => {
    setFilters({ propertyType: type }); fetchProperties(1);
  }, [setFilters, fetchProperties]);

  return (
    <div className="overflow-x-hidden bg-white dark:bg-zinc-950">

      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Slideshow */}
        <div className="absolute inset-0">
          <AnimatePresence mode="sync">
            <motion.div key={slide} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }} className="absolute inset-0">
              <Image src={HERO_SLIDES[slide]} alt="hero" fill sizes="100vw" className="object-cover" preload={slide === 0} loading={slide === 0 ? "eager" : "lazy"} fetchPriority={slide === 0 ? "high" : "auto"} />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/45 to-black/85" />
        </div>

        {/* Colour orbs */}
        <Orb size={600} x="-12%" y="-18%" color="bg-rose-600/35"   delay={0}   />
        <Orb size={450} x="68%"  y="52%"  color="bg-indigo-600/28" delay={1.5} />

        {/* Grid lines */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />

        {/* Hero content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-24">
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium px-5 py-2 rounded-full mb-8 shadow-xl">
              <span>✨</span>
              Connecting Dwellings, Linking Hearts
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            </motion.div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-white leading-[1.05] mb-6 tracking-tight">
              Find Your Perfect
              <br />
              <span className="gradient-text">Room in UP</span>
            </h1>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="text-lg sm:text-xl text-white/75 max-w-2xl mx-auto mb-10 leading-relaxed">
              Browse verified PGs, rooms &amp; flats across Prayagraj, Lucknow, Kanpur and 120+ cities in Uttar Pradesh.
            </motion.p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <div className="relative">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-rose-500/40 via-amber-400/30 to-rose-500/40 blur-lg animate-pulse pointer-events-none" />
              <SearchBar />
            </div>
            {/* Popular search chips */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }}
              className="flex flex-wrap justify-center gap-2 mt-4">
              {POPULAR_SEARCHES.map((s) => (
                <button key={s.label}
                  onClick={() => { setFilters({ city: s.city, propertyType: s.type }); fetchProperties(1); }}
                  className="text-xs text-white/70 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 hover:border-white/30 backdrop-blur-sm px-3 py-1.5 rounded-full transition-all font-medium">
                  {s.label}
                </button>
              ))}
            </motion.div>
            <LiveActivityTicker />
          </motion.div>

          {/* Add Property CTA */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            className="mt-6 flex justify-center">
            <Link href="/dashboard/properties/new">
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/30 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all shadow-lg">
                <span className="w-5 h-5 rounded-full bg-green-400 flex items-center justify-center text-xs font-black text-white">+</span>
                Add Property — Free
                <ArrowRight className="w-4 h-4" />
              </motion.div>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div variants={stagger} initial="hidden" animate="show"
            className="flex flex-wrap justify-center gap-6 sm:gap-12 mt-12">
            {STATS.map((s) => (
              <motion.div key={s.label} variants={fadeUp} whileHover={{ scale: 1.12, y: -4 }}
                className="text-center group cursor-default">
                <div className="text-3xl mb-1">{s.icon}</div>
                <div className="text-2xl sm:text-3xl font-black text-white group-hover:text-rose-300 transition-colors">
                  {s.display}
                </div>
                <div className="text-xs text-white/55 mt-0.5 font-medium">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Slide dots */}
          <div className="flex justify-center gap-2 mt-10">
            {HERO_SLIDES.map((_, i) => (
              <button key={i} onClick={() => setSlide(i)}
                className={`rounded-full transition-all duration-300 ${i === slide ? "w-8 h-2 bg-white" : "w-2 h-2 bg-white/40 hover:bg-white/70"}`} />
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-white/70 rounded-full mt-1 animate-bounce" />
          </div>
        </div>
      </section>

      {/* ══ ANIMATED COUNTER STRIP ════════════════════════════════════════ */}
      <section className="py-14 bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px,rgba(255,255,255,0.12) 1px,transparent 0)", backgroundSize: "32px 32px" }} />
        <div className="max-w-5xl mx-auto px-4 relative z-10">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {STATS.map((s) => (
              <motion.div key={s.label} variants={fadeUp} className="group">
                <div className="text-4xl sm:text-5xl font-black text-white mb-1">
                  <CountUp display={s.display} />
                </div>
                <div className="text-white/75 text-sm font-semibold uppercase tracking-widest">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ CATEGORIES — 3-D tilt ═════════════════════════════════════════ */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-500 text-sm font-semibold mb-3">Browse by Type</span>
          <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white">What are you looking for?</h2>
        </motion.div>
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-4 sm:gap-6">
          {CATEGORIES.map((cat) => (
            <motion.div key={cat.type} variants={fadeUp} className="w-36 sm:w-44">
              <TiltCard className="h-full">
                <motion.button whileTap={{ scale: 0.93 }} onClick={() => handleCategory(cat.type)}
                  className="w-full h-full flex flex-col items-center gap-3 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 hover:shadow-2xl transition-all group relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${cat.grad} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl`} />
                  <motion.div whileHover={{ rotateY: 180 }} transition={{ duration: 0.5 }}
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.grad} flex items-center justify-center text-white shadow-lg`}
                    style={{ transformStyle: "preserve-3d" }}>
                    {cat.icon}
                  </motion.div>
                  <span className="text-sm font-bold text-zinc-700 dark:text-zinc-200">{cat.label}</span>
                </motion.button>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ══ HOW IT WORKS — 3-D step cards ════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden bg-zinc-50 dark:bg-zinc-900/40">
        <Orb size={500} x="70%" y="-10%" color="bg-rose-500/10"   delay={0} />
        <Orb size={400} x="-5%" y="60%"  color="bg-blue-500/10"   delay={2} />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 text-sm font-semibold mb-3">Simple Process</span>
            <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white">Find a Room in 4 Steps</h2>
          </motion.div>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROCESS_STEPS.map((step, i) => (
              <motion.div key={i} variants={fadeUp}>
                <TiltCard>
                  <motion.div whileHover={{ y: -8 }}
                    className="relative bg-white dark:bg-zinc-900 rounded-3xl p-7 border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-2xl transition-all h-full overflow-hidden group">
                    {/* Step number watermark */}
                    <div className="absolute -top-4 -right-2 text-8xl font-black text-zinc-100 dark:text-zinc-800 select-none pointer-events-none group-hover:text-zinc-200 dark:group-hover:text-zinc-700 transition-colors">
                      {step.step}
                    </div>
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-3xl mb-5 shadow-lg`}
                      style={{ transform: "translateZ(20px)" }}>
                      {step.icon}
                    </div>
                    <h3 className="font-black text-zinc-900 dark:text-white text-xl mb-2">{step.title}</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{step.desc}</p>
                    {i < PROCESS_STEPS.length - 1 && (
                      <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-20">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-rose-500 to-amber-400 flex items-center justify-center shadow-lg">
                          <ArrowRight className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    )}
                  </motion.div>
                </TiltCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ CITIES — parallax 3-D cards ══════════════════════════════════ */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 text-sm font-semibold mb-3">Top Cities</span>
            <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white">Explore Across UP</h2>
          </motion.div>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {CITY_CARDS.map((c, i) => (
              <motion.div key={c.city} variants={fadeUp}>
                <TiltCard>
                  <Link href={`/properties?city=${c.city}`}>
                    <motion.div whileHover={{ y: -10, scale: 1.02 }}
                      className="relative h-56 sm:h-72 rounded-3xl overflow-hidden group cursor-pointer shadow-xl hover:shadow-2xl transition-all"
                      style={{ position: "relative" }}>
                      <Image src={c.img} alt={c.city} fill sizes="(max-width:640px) 50vw, 25vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                      {/* Shimmer sweep */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/12 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <p className="text-white font-black text-2xl">{c.city}</p>
                        <p className="text-white/65 text-sm mt-0.5">{c.count} listings</p>
                      </div>
                      <div className="absolute top-4 right-4 bg-white/15 backdrop-blur-md border border-white/25 text-white text-xs font-bold px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Explore →
                      </div>
                      {/* Rank badge */}
                      <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-amber-400 flex items-center justify-center text-white text-xs font-black shadow-lg">
                        {i + 1}
                      </div>
                    </motion.div>
                  </Link>
                </TiltCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ FEATURED PROPERTIES ══════════════════════════════════════════ */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-500 text-sm font-semibold mb-3">Featured</span>
            <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white">Handpicked Properties</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">Verified stays across Uttar Pradesh</p>
          </div>
          <Link href="/properties">
            <Button variant="outline" size="sm" className="group">
              View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><SkeletonGrid count={8} /></motion.div>
          ) : properties.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-24">
              <div className="text-7xl mb-4">🏠</div>
              <p className="text-zinc-400 text-lg mb-6">No properties yet. Be the first to list one!</p>
              <Link href="/auth/register"><Button size="lg">Get Started <ArrowRight className="w-4 h-4" /></Button></Link>
            </motion.div>
          ) : (
            <motion.div key="grid" variants={stagger} initial="hidden" animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {properties.slice(0, 8).map((p, i) => (
                <motion.div key={p._id} variants={fadeUp}><PropertyCard property={p} index={i} /></motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <RecommendationsSection />
      <RecentlyViewed />

      {/* ══ WHY US — 3-D feature cards ═══════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden bg-zinc-50 dark:bg-zinc-900/50">
        <Orb size={600} x="60%" y="-20%" color="bg-rose-500/10"   delay={0} />
        <Orb size={400} x="-5%" y="50%"  color="bg-indigo-500/10" delay={2} />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-500 text-sm font-semibold mb-3">Why Stayerra</span>
            <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white">Built for Tenants &amp; Owners</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2 max-w-xl mx-auto">Everything you need to find or list a room — safely, quickly, and fairly.</p>
          </motion.div>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHY_US.map((item, i) => (
              <motion.div key={i} variants={fadeUp}>
                <TiltCard>
                  <motion.div whileHover={{ y: -8 }}
                    className="h-full bg-white dark:bg-zinc-900 rounded-3xl p-7 border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.grad} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl`} />
                    <motion.div
                      whileHover={{ rotateY: 180 }}
                      transition={{ duration: 0.6 }}
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.grad} flex items-center justify-center text-white mb-5 shadow-lg`}
                      style={{ transformStyle: "preserve-3d" }}>
                      {item.icon}
                    </motion.div>
                    <h3 className="font-black text-zinc-900 dark:text-white text-lg mb-2">{item.title}</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4">{item.desc}</p>
                    <div className="flex items-center gap-2 text-xs font-semibold text-green-600 dark:text-green-400">
                      <CheckCircle className="w-3.5 h-3.5" />
                      {item.check}
                    </div>
                  </motion.div>
                </TiltCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ OWNER CTA STRIP ══════════════════════════════════════════ */}
      <OwnerCTAStrip />

      {/* ══ TESTIMONIALS — 3-D carousel ══════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
        <Orb size={500} x="70%" y="10%"  color="bg-rose-600/15"   delay={0} />
        <Orb size={400} x="-5%" y="50%"  color="bg-indigo-600/12" delay={2} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px,rgba(255,255,255,0.04) 1px,transparent 0)", backgroundSize: "36px 36px" }} />
        <div className="max-w-5xl mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-sm font-semibold mb-3">Testimonials</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">What People Say</h2>
          </motion.div>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div key={testimonialIdx}
                initial={{ opacity: 0, x: 60, rotateY: -15 }}
                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                exit={{ opacity: 0, x: -60, rotateY: 15 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformStyle: "preserve-3d" }}
                className="bg-white/8 backdrop-blur-md border border-white/12 rounded-3xl p-8 sm:p-10">
                <Quote className="w-10 h-10 text-rose-400 mb-6 opacity-80" />
                <p className="text-white/85 text-lg sm:text-xl leading-relaxed mb-8 font-medium">
                  &ldquo;{TESTIMONIALS[testimonialIdx].text}&rdquo;
                </p>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${TESTIMONIALS[testimonialIdx].color} flex items-center justify-center text-white font-black text-lg shadow-lg`}>
                      {TESTIMONIALS[testimonialIdx].avatar}
                    </div>
                    <div>
                      <p className="text-white font-bold">{TESTIMONIALS[testimonialIdx].name}</p>
                      <p className="text-white/50 text-sm">{TESTIMONIALS[testimonialIdx].role}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: TESTIMONIALS[testimonialIdx].rating }).map((_, i) => (
                      <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.08 }}>
                        <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Nav */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => setTestimonialIdx(i => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
                className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
              <div className="flex gap-2">
                {TESTIMONIALS.map((_, i) => (
                  <button key={i} onClick={() => setTestimonialIdx(i)}
                    className={`rounded-full transition-all duration-300 ${i === testimonialIdx ? "w-6 h-2 bg-rose-400" : "w-2 h-2 bg-white/30 hover:bg-white/60"}`} />
                ))}
              </div>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => setTestimonialIdx(i => (i + 1) % TESTIMONIALS.length)}
                className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </section>

      {/* ══ CTA — immersive ═══════════════════════════════════════════════ */}
      <section className="py-28 relative overflow-hidden bg-gradient-to-br from-zinc-900 via-rose-950 to-zinc-900">
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px,rgba(255,255,255,0.06) 1px,transparent 0)", backgroundSize: "40px 40px" }} />
        <Orb size={700} x="-15%" y="-20%" color="bg-rose-600/20"   delay={0} />

        <div className="relative z-10 max-w-3xl mx-auto text-center px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <div className="inline-block mb-6">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-500 to-amber-400 flex items-center justify-center mx-auto shadow-2xl shadow-rose-500/40">
                <MapPin className="w-10 h-10 text-white" />
              </div>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-5 leading-tight">
              List Your Property<br />
              <span className="gradient-text">Earn Every Month</span>
            </h2>
            <p className="text-white/65 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Join thousands of owners across UP earning steady income. Free to list, easy to manage.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <motion.div whileHover={{ scale: 1.06, y: -2 }} whileTap={{ scale: 0.97 }}>
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-rose-500 to-amber-400 text-white border-0 shadow-2xl shadow-rose-500/30 hover:shadow-rose-500/50 transition-shadow">
                    Start Hosting <ArrowRight className="w-5 h-5" />
                  </Button>
                </motion.div>
              </Link>
              <Link href="/properties">
                <motion.div whileHover={{ scale: 1.06, y: -2 }} whileTap={{ scale: 0.97 }}>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 backdrop-blur-sm">
                    Browse Properties
                  </Button>
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
