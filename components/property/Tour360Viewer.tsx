"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Maximize2, RotateCcw, Move } from "lucide-react";
import { useTranslations } from "next-intl";

interface Props {
  images: string[];
  title: string;
}

export default function Tour360Viewer({ images, title }: Props) {
  const t = useTranslations("tour360");
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startRot, setStartRot] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const gyroRef = useRef<{ beta: number; gamma: number } | null>(null);

  // Gyroscope support
  useEffect(() => {
    if (!open) return;
    const handler = (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null) return;
      gyroRef.current = { beta: e.beta, gamma: e.gamma };
      setRotation({ x: e.beta * 0.3, y: e.gamma * 0.5 });
    };
    window.addEventListener("deviceorientation", handler);
    return () => window.removeEventListener("deviceorientation", handler);
  }, [open]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartRot({ ...rotation });
  }, [rotation]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - startPos.x;
    const dy = e.clientY - startPos.y;
    setRotation({ x: startRot.x + dy * 0.3, y: startRot.y + dx * 0.3 });
  }, [isDragging, startPos, startRot]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    setIsDragging(true);
    setStartPos({ x: t.clientX, y: t.clientY });
    setStartRot({ ...rotation });
  }, [rotation]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    const t = e.touches[0];
    const dx = t.clientX - startPos.x;
    const dy = t.clientY - startPos.y;
    setRotation({ x: startRot.x + dy * 0.3, y: startRot.y + dx * 0.3 });
  }, [isDragging, startPos, startRot]);

  const reset = () => setRotation({ x: 0, y: 0 });

  if (!images.length) return null;

  return (
    <>
      {/* Trigger button */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-shadow"
      >
        <Maximize2 className="w-4 h-4" />
        {t("button")}
        <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">{t("rooms", { count: images.length })}</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur-sm flex-shrink-0">
              <div>
                <p className="text-white font-semibold text-sm">{t("header", { title })}</p>
                <p className="text-white/50 text-xs">{t("roomOf", { current: current + 1, total: images.length })}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={reset} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors">
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button onClick={() => setOpen(false)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 360° Viewer */}
            <div
              ref={containerRef}
              className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing select-none"
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={() => setIsDragging(false)}
            >
              {/* The 360° image rendered with perspective transform */}
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ perspective: "800px" }}
              >
                <div
                  style={{
                    transform: `rotateX(${-rotation.x}deg) rotateY(${rotation.y}deg)`,
                    transformStyle: "preserve-3d",
                    transition: isDragging ? "none" : "transform 0.1s ease-out",
                    width: "100%",
                    height: "100%",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={images[current]}
                    alt={`360° view ${current + 1}`}
                    className="w-full h-full object-cover"
                    draggable={false}
                    style={{ borderRadius: 0 }}
                  />
                </div>
              </div>

              {/* Drag hint */}
              <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ delay: 2, duration: 1 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <div className="bg-black/60 backdrop-blur-sm rounded-2xl px-5 py-3 flex items-center gap-2 text-white text-sm">
                  <Move className="w-5 h-5" />
                  {t("dragHint")}
                </div>
              </motion.div>

              {/* Nav arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c - 1 + images.length) % images.length); reset(); }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c + 1) % images.length); reset(); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Room thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 px-4 py-3 bg-black/80 overflow-x-auto flex-shrink-0">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => { setCurrent(i); reset(); }}
                    className={`flex-shrink-0 w-16 h-12 rounded-xl overflow-hidden border-2 transition-all ${
                      i === current ? "border-indigo-400 scale-105" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`Room ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
