"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ZoomIn, Download } from "lucide-react";
import Image from "next/image";

interface ImageCarouselProps {
  images: string[];
  alt?: string;
  height?: number;
  autoplay?: boolean;
  autoplayInterval?: number;
  showControls?: boolean;
  showThumbnails?: boolean;
  onImageChange?: (index: number) => void;
}

export function ImageCarousel({
  images,
  alt = "Property image",
  height = 500,
  autoplay = true,
  autoplayInterval = 5000,
  showControls = true,
  showThumbnails = true,
  onImageChange,
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    if (!autoplay) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, autoplayInterval);

    return () => clearInterval(timer);
  }, [autoplay, autoplayInterval, images.length]);

  useEffect(() => {
    onImageChange?.(currentIndex);
  }, [currentIndex, onImageChange]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsZoomed(false);
    setZoomLevel(1);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setIsZoomed(false);
    setZoomLevel(1);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(images[currentIndex]);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `property-${currentIndex + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download image:", error);
    }
  };

  if (images.length === 0) {
    return (
      <div
        className="w-full bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800 rounded-2xl flex items-center justify-center"
        style={{ height: `${height}px` }}
      >
        <p className="text-zinc-500 dark:text-zinc-400">No images available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Carousel */}
      <div className="relative rounded-2xl overflow-hidden bg-black">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="relative w-full"
            style={{ height: `${height}px` }}
          >
            <Image
              src={images[currentIndex]}
              alt={`${alt} ${currentIndex + 1}`}
              fill
              className={`object-cover transition-transform duration-300 ${
                isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
              }`}
              style={{
                transform: isZoomed ? `scale(${zoomLevel})` : "scale(1)",
              }}
              onClick={() => {
                if (isZoomed) {
                  setIsZoomed(false);
                  setZoomLevel(1);
                } else {
                  setIsZoomed(true);
                  setZoomLevel(2);
                }
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Overlay Controls */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-4 gap-3">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg text-white transition-all"
            title="Download image"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm">Download</span>
          </button>
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg text-white transition-all"
            title="Zoom image"
          >
            <ZoomIn className="w-4 h-4" />
            <span className="text-sm">{isZoomed ? "Zoom Out" : "Zoom In"}</span>
          </button>
        </div>

        {/* Navigation Controls */}
        {showControls && images.length > 1 && (
          <>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white transition-all"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white transition-all"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </motion.button>

            {/* Counter */}
            <div className="absolute bottom-4 right-4 z-10 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-sm font-medium">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setCurrentIndex(index);
                setIsZoomed(false);
                setZoomLevel(1);
              }}
              className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex
                  ? "border-blue-500 ring-2 ring-blue-500/50"
                  : "border-zinc-300 dark:border-zinc-600 hover:border-blue-400"
              }`}
            >
              <Image
                src={image}
                alt={`${alt} thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}

