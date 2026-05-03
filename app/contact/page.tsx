"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, CheckCircle, Twitter, Instagram, Facebook, Sparkles, Zap, ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";
import { useTranslations } from "next-intl";

function MagneticButton({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15 });
  const sy = useSpring(y, { stiffness: 200, damping: 15 });
  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    x.set((e.clientX - r.left - r.width / 2) * 0.35);
    y.set((e.clientY - r.top - r.height / 2) * 0.35);
  };
  const onLeave = () => { x.set(0); y.set(0); };
  return (
    <motion.div ref={ref} style={{ x: sx, y: sy }} onMouseMove={onMove} onMouseLeave={onLeave} className={className}>
      {children}
    </motion.div>
  );
}

function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-50, 50], [8, -8]);
  const rotateY = useTransform(x, [-50, 50], [-8, 8]);
  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    x.set(e.clientX - r.left - r.width / 2);
    y.set(e.clientY - r.top - r.height / 2);
  };
  const onLeave = () => { x.set(0); y.set(0); };
  return (
    <motion.div ref={ref} style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={onMove} onMouseLeave={onLeave} className={className}>
      {children}
    </motion.div>
  );
}

function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let start = 0;
      const step = target / 60;
      const t = setInterval(() => {
        start += step;
        if (start >= target) { setCount(target); clearInterval(t); }
        else setCount(Math.floor(start));
      }, 16);
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

export default function ContactPage() {
  const t = useTranslations("contact");
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const CONTACT_CARDS = [
    { icon: Mail,    title: t("emailUs"),  value: "hello@nestora.com",  sub: t("emailSub"),   color: "from-rose-500 to-pink-600",    bg: "bg-rose-50 dark:bg-rose-950/30",    href: "mailto:hello@nestora.com" },
    { icon: Phone,   title: t("callUs"),   value: "+91 98765 43210",    sub: t("callSub"),    color: "from-blue-500 to-cyan-600",    bg: "bg-blue-50 dark:bg-blue-950/30",    href: "tel:+919876543210" },
    { icon: MapPin,  title: t("visitUs"),  value: "Prayagraj, UP",      sub: t("visitSub"),   color: "from-green-500 to-emerald-600", bg: "bg-green-50 dark:bg-green-950/30",  href: "#" },
    { icon: Clock,   title: t("support"),  value: "24/7 Live Chat",     sub: t("supportSub"), color: "from-purple-500 to-violet-600", bg: "bg-purple-50 dark:bg-purple-950/30", href: "#" },
  ];

  const FAQS = (t.raw("faqs") as { q: string; a: string }[]);

  const handleMouseMove = (e: React.MouseEvent) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await new Promise((r) => setTimeout(r, 1600));
    setSending(false);
    setSent(true);
  };

  const inputCls = (field: string) =>
    `w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-all duration-300 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 ${focused === field ? "border-rose-400 ring-2 ring-rose-200 dark:ring-rose-800" : "border-zinc-200 dark:border-zinc-700"}`;

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 overflow-x-hidden" onMouseMove={handleMouseMove}>
      {/* Cursor glow */}
      <motion.div
        className="fixed w-64 h-64 rounded-full pointer-events-none z-0 blur-3xl opacity-20"
        style={{
          x: useTransform(mouseX, (v) => v - 128),
          y: useTransform(mouseY, (v) => v - 128),
          background: "radial-gradient(circle, #f43f5e, transparent)",
        }}
      />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 text-center z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="inline-flex items-center gap-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-rose-100 dark:border-rose-900">
            <Sparkles className="w-4 h-4" />
            {t("badge")}
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-zinc-900 dark:text-white mb-6 leading-tight">
            Get in{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-600">{t("titleHighlight")}</span>
          </h1>
          <p className="text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-10 px-4 z-10 relative">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[
            { label: t("happyUsers"), value: 48000, suffix: "+" },
            { label: t("avgResponse"), value: 2, suffix: "h" },
            { label: t("properties"), value: 12000, suffix: "+" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-black text-rose-500">
                <CountUp target={s.value} suffix={s.suffix} />
              </div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact cards */}
      <section className="py-12 px-4 z-10 relative">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CONTACT_CARDS.map((card) => (
            <TiltCard key={card.title} className="cursor-pointer">
              <a
                href={card.href}
                className={`block p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 ${card.bg} hover:shadow-xl transition-shadow duration-300`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                <div className="font-bold text-zinc-900 dark:text-white text-sm">{card.title}</div>
                <div className="text-zinc-700 dark:text-zinc-300 text-sm mt-1 font-medium">{card.value}</div>
                <div className="text-zinc-400 text-xs mt-1">{card.sub}</div>
              </a>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* Form + FAQ */}
      <section className="py-16 px-4 z-10 relative">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form */}
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-3xl font-black text-zinc-900 dark:text-white mb-2">{t("sendMessage")}</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mb-8 text-sm">{t("sendSubtitle")}</p>
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">{t("messageSent")}</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">{t("messageSentSub")}</p>
                  <button onClick={() => setSent(false)} className="text-rose-500 text-sm font-medium hover:underline">
                    {t("sendAnother")}
                  </button>
                </motion.div>
              ) : (
                <motion.form key="form" onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1 block">{t("nameLabel")}</label>
                      <input className={inputCls("name")} placeholder={t("namePlaceholder")}
                        value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        onFocus={() => setFocused("name")} onBlur={() => setFocused(null)} required />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1 block">{t("emailLabel")}</label>
                      <input type="email" className={inputCls("email")} placeholder={t("emailPlaceholder")}
                        value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        onFocus={() => setFocused("email")} onBlur={() => setFocused(null)} required />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1 block">{t("subjectLabel")}</label>
                    <input className={inputCls("subject")} placeholder={t("subjectPlaceholder")}
                      value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                      onFocus={() => setFocused("subject")} onBlur={() => setFocused(null)} required />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1 block">{t("messageLabel")}</label>
                    <textarea rows={5} className={inputCls("message") + " resize-none"} placeholder={t("messagePlaceholder")}
                      value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                      onFocus={() => setFocused("message")} onBlur={() => setFocused(null)} required />
                  </div>
                  <MagneticButton className="w-full">
                    <Button type="submit" disabled={sending}
                      className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                      {sending ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}>
                          <Zap className="w-4 h-4" />
                        </motion.div>
                      ) : (
                        <><Send className="w-4 h-4" />{t("sendBtn")}<ArrowRight className="w-4 h-4" /></>
                      )}
                    </Button>
                  </MagneticButton>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

          {/* FAQ */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-3xl font-black text-zinc-900 dark:text-white mb-2">{t("faqTitle")}</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mb-8 text-sm">{t("faqSubtitle")}</p>
            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <div key={i} className="border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    {faq.q}
                    <motion.span
                      animate={{ rotate: openFaq === i ? 45 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-rose-500 text-lg leading-none ml-4 flex-shrink-0"
                    >
                      +
                    </motion.span>
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-4 text-sm text-zinc-500 dark:text-zinc-400">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Social links */}
            <div className="mt-10">
              <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-4">Find us on social</p>
              <div className="flex gap-3">
                {[
                  { icon: Twitter, href: "#", label: "Twitter" },
                  { icon: Instagram, href: "#", label: "Instagram" },
                  { icon: Facebook, href: "#", label: "Facebook" },
                  { icon: MessageCircle, href: "#", label: "Chat" },
                ].map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/30 transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
