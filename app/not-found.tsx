"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import { useTranslations } from "next-intl";

const GLITCH_CHARS = "!@#$%^&*01";

function GlitchText({ text }: { text: string }) {
  const [display, setDisplay] = useState(text);
  const [glitching, setGlitching] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitching(true);
      let iter = 0;
      const inner = setInterval(() => {
        setDisplay(
          text.split("").map((c, i) =>
            i < iter ? c : GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
          ).join("")
        );
        iter += 0.5;
        if (iter >= text.length) {
          setDisplay(text);
          setGlitching(false);
          clearInterval(inner);
        }
      }, 40);
    }, 3000);
    return () => clearInterval(interval);
  }, [text]);
  return <span className={glitching ? "text-rose-400" : ""}>{display}</span>;
}

export default function NotFound() {
  const t = useTranslations("notFound");
  const [clicked, setClicked] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const eyeRef = useRef<HTMLDivElement>(null);
  const springX = useSpring(mouseX, { stiffness: 100, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 20 });

  // Generate random particle data client-side only to avoid hydration mismatch
  const particles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 1,
        duration: Math.random() * 6 + 4,
        delay: Math.random() * 3,
      })),
    []
  );

  useEffect(() => {
    const move = (e: MouseEvent) => {
      const el = eyeRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const max = 10;
      mouseX.set((dx / dist) * Math.min(dist, max));
      mouseY.set((dy / dist) * Math.min(dist, max));
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [mouseX, mouseY]);

  return (
    <div className="relative min-h-screen bg-zinc-950 flex flex-col items-center justify-center overflow-hidden text-white select-none">
      {/* Floating particles — client only via useMemo */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-rose-500/20"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -30, 0], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(244,63,94,0.12)_0%,_transparent_70%)] pointer-events-none" />

      {/* 404 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 14 }}
        className="relative z-10 text-center"
      >
        <div className="text-[10rem] md:text-[16rem] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-zinc-600 to-zinc-800 pointer-events-none">
          <GlitchText text="404" />
        </div>

        {/* Eyeball */}
        <div ref={eyeRef} className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-white flex items-center justify-center shadow-2xl">
            <motion.div
              style={{ x: springX, y: springY }}
              className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-zinc-900 flex items-center justify-center"
            >
              <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-white" />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Text + buttons */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="relative z-10 text-center px-4 -mt-8 md:-mt-16"
      >
        <h1 className="text-2xl md:text-4xl font-bold text-white mb-3">
          {t("title")}
        </h1>
        <p className="text-zinc-400 text-sm md:text-base max-w-md mx-auto mb-8">
          {t("subtitle")}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Link href="/" className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors">
              {t("goHome")}
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <button onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors">
              {t("goBack")}
            </button>
          </motion.div>
        </div>
      </motion.div>

      {/* Easter egg */}
      <motion.button className="absolute bottom-8 text-zinc-600 text-xs hover:text-zinc-400 transition-colors z-10"
        onClick={() => setClicked(true)} whileTap={{ scale: 0.9 }}>
        {t("clickMe")}
      </motion.button>
      <AnimatePresence>
        {clicked && (
          <motion.div key="egg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            onAnimationComplete={() => setTimeout(() => setClicked(false), 2000)}
            className="absolute bottom-16 text-rose-400 text-sm font-medium z-10">
            {t("easterEgg")}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
