"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import SafeImage from "@/components/ui/SafeImage";
import { ChevronLeft, ChevronRight, X, Grid } from "lucide-react";

interface ImageGalleryProps {
  images: string[];
  title: string;
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const fallback = "/placeholder-banner.svg";
  const imgs = images?.length ? images : [fallback];

  const prev = () => setCurrentIndex((i) => (i - 1 + imgs.length) % imgs.length);
  const next = () => setCurrentIndex((i) => (i + 1) % imgs.length);

  return (
    <>
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[420px] rounded-2xl overflow-hidden">
        <div className="col-span-2 row-span-2 relative cursor-pointer group" onClick={() => { setCurrentIndex(0); setLightboxOpen(true); }}>
          <SafeImage src={imgs[0]} alt={title} fill className="object-cover group-hover:brightness-90 transition-all" fallbackType="property" />
        </div>
        {imgs.slice(1, 5).map((img, i) => (
          <div key={i} className="relative cursor-pointer group" onClick={() => { setCurrentIndex(i + 1); setLightboxOpen(true); }}>
            <SafeImage src={img} alt={`${title} ${i + 2}`} fill className="object-cover group-hover:brightness-90 transition-all" fallbackType="property" />
            {i === 3 && imgs.length > 5 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-semibold flex items-center gap-1.5">
                  <Grid className="w-4 h-4" /> +{imgs.length - 5} more
                </span>
              </div>
            )}
          </div>
        ))}
        {imgs.length === 1 && Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-zinc-100" />
        ))}
      </div>

      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          >
            <button onClick={() => setLightboxOpen(false)} className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-xl">
              <X className="w-6 h-6" />
            </button>
            <button onClick={prev} className="absolute left-4 text-white p-2 hover:bg-white/10 rounded-xl">
              <ChevronLeft className="w-8 h-8" />
            </button>
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative w-full max-w-4xl h-[70vh] mx-16"
            >
              <SafeImage src={imgs[currentIndex]} alt={title} fill className="object-contain" fallbackType="property" />
            </motion.div>
            <button onClick={next} className="absolute right-4 text-white p-2 hover:bg-white/10 rounded-xl">
              <ChevronRight className="w-8 h-8" />
            </button>
            <div className="absolute bottom-4 text-white text-sm">{currentIndex + 1} / {imgs.length}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
