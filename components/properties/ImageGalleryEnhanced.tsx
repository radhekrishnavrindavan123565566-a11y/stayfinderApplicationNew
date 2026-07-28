"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import Image from "next/image";

interface ImageGalleryEnhancedProps {
  images: string[];
  title: string;
}

export default function ImageGalleryEnhanced({ images, title }: ImageGalleryEnhancedProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const currentImage = images[selectedIdx];

  const handleZoom = (factor: number) => {
    setZoom((z) => Math.max(1, Math.min(4, z + factor)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPanX(Math.max(-100, Math.min(100, e.clientX - dragStart.x)));
      setPanY(Math.max(-100, Math.min(100, e.clientY - dragStart.y)));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? -0.2 : 0.2;
    handleZoom(factor);
  };

  const handlePrev = () => {
    setSelectedIdx((i) => (i === 0 ? images.length - 1 : i - 1));
    handleReset();
  };

  const handleNext = () => {
    setSelectedIdx((i) => (i === images.length - 1 ? 0 : i + 1));
    handleReset();
  };

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-96 bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800 rounded-2xl flex items-center justify-center">
        <p className="text-zinc-500 dark:text-zinc-400">No images available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main viewer */}
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full bg-black rounded-2xl overflow-hidden"
        style={{ aspectRatio: "16/9" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedIdx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative w-full h-full"
            style={{
              cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "default",
              transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`,
              transformOrigin: "center",
              transition: isDragging ? "none" : "transform 0.2s ease-out",
            }}
          >
            <Image
              src={currentImage}
              alt={`${title} - Image ${selectedIdx + 1}`}
              fill
              className="object-contain"
              priority
              quality={95}
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10 backdrop-blur-sm"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10 backdrop-blur-sm"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Controls overlay */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-black/50 backdrop-blur-sm rounded-xl p-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleZoom(0.5)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleZoom(-0.5)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={zoom <= 1}
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              disabled={zoom === 1 && panX === 0 && panY === 0}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Reset view"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-white/80">
              {(zoom * 100).toFixed(0)}%
            </span>
            <span className="text-xs font-medium text-white/80">
              {selectedIdx + 1} / {images.length}
            </span>
          </div>
        </div>

        {zoom > 1 && (
          <p className="absolute top-4 left-4 text-xs text-white/70 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-lg">
            Drag to pan
          </p>
        )}
      </motion.div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((img, idx) => (
            <motion.button
              key={idx}
              onClick={() => {
                setSelectedIdx(idx);
                handleReset();
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                idx === selectedIdx
                  ? "border-rose-500"
                  : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
              }`}
            >
              <Image
                src={img}
                alt={`Thumbnail ${idx + 1}`}
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
