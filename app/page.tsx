"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence, type Variants } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star, Shield, Clock, MapPin, Sparkles, TrendingUp, Users, Home } from "lucide-react";
import SearchBar from "@/components/property/SearchBar";
import PropertyCard from "@/components/property/PropertyCard";
import { usePropertyStore, Property } from "@/store/propertyStore";
import { useAuthStore } from "@/store/authStore";
import Button from "@/components/ui/Button";
import { SkeletonGrid } from "@/components/ui/SkeletonCard";
import axios from "axios";
import RecentlyViewed from "@/components/home/RecentlyViewed";

const CATEGORIES = [
  { label: "Apartments", icon: "🏢", type: "apartment" },
  { label: "Houses", icon: "🏠", type: "house" },
  { label: "Villas", icon: "🏡", type: "villa" },
  { label: "Studios", icon: "🛋️", type: "studio" },
  { label: "Cabins", icon: "🌲", type: "cabin" },
  { label: "Condos", icon: "🏙️", type: "condo" },
];

const STATS = [
  { value: "10K+", label: "Properties" },
  { value: "50K+", label: "Happy Guests" },
  { value: "120+", label: "Cities" },
  { value: "4.9?", label: "Avg Rating" },
];

const WHY_US = [
  { icon: <Shield className="w-6 h-6" />, title: "Verified Properties", desc: "Every listing is verified by our team for quality and accuracy.", color: "bg-blue-50 text-blue-500" },
  { icon: <Star className="w-6 h-6" />, title: "Top Rated Stays", desc: "Browse properties with thousands of 5-star reviews from real guests.", color: "bg-amber-50 text-amber-500" },
  { icon: <Clock className="w-6 h-6" />, title: "Instant Booking", desc: "Book your stay in minutes with our seamless booking process.", color: "bg-green-50 text-green-500" },
  { icon: <TrendingUp className="w-6 h-6" />, title: "Best Prices", desc: "AI-powered pricing ensures you always get the best deal available.", color: "bg-purple-50 text-purple-500" },
  { icon: <MapPin className="w-6 h-6" />, title: "Prime Locations", desc: "Properties in the most sought-after neighborhoods worldwide.", color: "bg-rose-50 text-rose-500" },
  { icon: <Sparkles className="w-6 h-6" />, title: "AI Recommendations", desc: "Smart suggestions tailored to your preferences and history.", color: "bg-indigo-50 text-indigo-500" },
];

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

function RecommendationsSection() {
  const { user, accessToken } = useAuthStore();
  const [recs, setRecs] = useState<Property[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user || loaded) return;
    axios
      .get("/api/recommendations?limit=4", {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      })
      .then(({ data }) => { setRecs(data.data.recommendations); setLoaded(true); })
      .catch(() => {});
  }, [user, accessToken, loaded]);

  if (!user || recs.length === 0) return null;

  return (
    <section className="py-16 px-4 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3 mb-8"
      >
        <motion.div
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center"
        >
          <Sparkles className="w-5 h-5 text-purple-600" />
        </motion.div>
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Recommended for You</h2>
          <p className="text-sm text-zinc-500">Based on your booking history</p>
        </div>
      </motion.div>
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {recs.map((p, i) => (
          <motion.div key={p._id} variants={fadeUp}>
            <PropertyCard property={p} index={i} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

export default function HomePage() {
  const { properties, isLoading, fetchProperties, setFilters } = usePropertyStore();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  useEffect(() => { fetchProperties(1); }, [fetchProperties]);

  const handleCategory = (type: string) => {
    setFilters({ propertyType: type });
    fetchProperties(1);
  };

  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <motion.div style={{ y: heroY, scale: heroScale }} className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1920&q=80"
            alt="Hero background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/40 to-black/75" />
        </motion.div>

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 18 }).map((_, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -40, 0], opacity: [0, 0.5, 0] }}
              transition={{ duration: 5 + i * 0.4, repeat: Infinity, delay: i * 0.5, ease: "easeInOut" }}
              className="absolute w-1.5 h-1.5 bg-white/40 rounded-full"
              style={{ left: `${(i * 5.7) % 100}%`, top: `${(i * 8.3) % 100}%` }}
            />
          ))}
        </div>

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-block bg-rose-500/20 backdrop-blur-sm border border-rose-500/30 text-rose-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6"
            >
              ?? Find your perfect stay
            </motion.span>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-tight mb-6">
              Discover Your
              <span className="text-rose-400"> Dream</span>
              <br />Rental Home
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="text-base sm:text-lg lg:text-xl text-white/80 max-w-2xl mx-auto mb-10"
            >
              Browse thousands of unique properties. From cozy studios to luxury villas - find the perfect place for your next stay.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <SearchBar />
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="flex flex-wrap justify-center gap-4 sm:gap-8 mt-10"
          >
            {STATS.map((s) => (
              <motion.div key={s.label} variants={fadeUp} className="text-center group">
                <div className="text-2xl sm:text-3xl font-bold text-white group-hover:text-rose-300 transition-colors duration-300">{s.value}</div>
                <div className="text-xs sm:text-sm text-white/60 mt-0.5">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60"
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <motion.div
              animate={{ y: [0, 8, 0], opacity: [1, 0, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1 h-2 bg-white/60 rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* Categories */}
      <section className="py-16 sm:py-20 px-4 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-2">Browse by Type</h2>
          <p className="text-zinc-500 dark:text-zinc-400">Find exactly what you&apos;re looking for</p>
        </motion.div>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4"
        >
          {CATEGORIES.map((cat) => (
            <motion.button
              key={cat.type}
              variants={fadeUp}
              whileHover={{ y: -6, scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCategory(cat.type)}
              className="flex flex-col items-center gap-2 p-3 sm:p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:border-rose-200 dark:hover:border-rose-800 hover:shadow-lg hover:shadow-rose-500/10 transition-all cursor-pointer"
            >
              <span className="text-2xl sm:text-3xl">{cat.icon}</span>
              <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{cat.label}</span>
            </motion.button>
          ))}
        </motion.div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 sm:py-20 px-4 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10"
        >
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-1">Featured Properties</h2>
            <p className="text-zinc-500 dark:text-zinc-400">Handpicked stays for your next adventure</p>
          </div>
          <Link href="/properties">
            <Button variant="outline" size="sm" className="self-start sm:self-auto">
              View All <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SkeletonGrid count={8} />
            </motion.div>
          ) : properties.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="text-6xl mb-4">??</div>
              <p className="text-zinc-400 text-lg mb-4">No properties found. Be the first to list one!</p>
              <Link href="/auth/register"><Button>Get Started</Button></Link>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              variants={stagger}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6"
            >
              {properties.slice(0, 8).map((p, i) => (
                <motion.div key={p._id} variants={fadeUp}>
                  <PropertyCard property={p} index={i} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* AI Recommendations */}
      <RecommendationsSection />

      {/* Recently Viewed */}
      <RecentlyViewed />

      {/* Why Us */}
      <section className="py-20 sm:py-24 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-2">Why Choose StayFinder?</h2>
            <p className="text-zinc-500 dark:text-zinc-400">Everything you need for a perfect stay</p>
          </motion.div>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {WHY_US.map((item, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(0,0,0,0.08)" }}
                className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-100 dark:border-zinc-800 text-center transition-shadow"
              >
                <div className={`w-12 h-12 ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>{item.icon}</div>
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-24 bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[
            { w: 400, x: -10, y: -10, delay: 0 },
            { w: 300, x: 70, y: 60, delay: 1 },
            { w: 200, x: 40, y: 80, delay: 2 },
          ].map((orb, i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.18, 0.08] }}
              transition={{ duration: 6 + i * 2, repeat: Infinity, delay: orb.delay }}
              className="absolute rounded-full bg-white"
              style={{ width: orb.w, height: orb.w, left: `${orb.x}%`, top: `${orb.y}%` }}
            />
          ))}
        </div>
        <div className="relative max-w-3xl mx-auto text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="inline-block mb-6"
            >
              <MapPin className="w-10 h-10 text-white/80 mx-auto" />
            </motion.div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">Ready to List Your Property?</h2>
            <p className="text-white/80 text-base sm:text-lg mb-8 max-w-xl mx-auto">
              Join thousands of owners earning from their properties. It&apos;s free to get started.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="w-full sm:w-auto bg-white text-rose-500 hover:bg-zinc-50 shadow-xl">
                  Start Hosting <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/properties">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10">
                  Browse Properties
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
