"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ZoomIn, ZoomOut, Download, RotateCcw } from "lucide-react";
import Image from "next/image";

interface FloorPlanProps {
  imageUrl?: string;
  title: string;
  totalArea?: number;
  roomDetails?: Array<{ name: string; area: number; unit: "sqm" | "sqft" }>;
}

export default function FloorPlan({ imageUrl, title, totalArea, roomDetails }: FloorPlanProps) {
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  if (!imageUrl) {
    return (
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-8 text-center">
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">Floor plan not available</p>
      </div>
    );
  }

  const handleZoom = (factor: number) => {
    setZoom((z) => Math.max(1, Math.min(4, z + factor)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPanX(e.clientX - dragStart.x);
      setPanY(e.clientY - dragStart.y);
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

  const downloadImage = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `${title}-floor-plan.jpg`;
    link.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2 flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm">📐</span>
          Floor Plan
        </h2>
        {totalArea && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Total Area: <span className="font-semibold text-zinc-900 dark:text-white">{totalArea} sqm</span>
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleZoom(0.5)}
          className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          title="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom(-0.5)}
          className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={zoom <= 1}
          title="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleReset}
          className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          title="Reset view"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={downloadImage}
          className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          title="Download floor plan"
        >
          <Download className="w-4 h-4" />
        </button>
        <span className="ml-auto px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {(zoom * 100).toFixed(0)}%
        </span>
      </div>

      {/* Floor Plan Image */}
      <div
        className="relative w-full bg-zinc-100 dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800"
        style={{ aspectRatio: "4/3", cursor: isDragging ? "grabbing" : zoom > 1 ? "grab" : "default" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="w-full h-full relative"
          style={{
            transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`,
            transformOrigin: "center",
            transition: isDragging ? "none" : "transform 0.2s ease-out",
          }}
        >
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Room Details */}
      {roomDetails && roomDetails.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {roomDetails.map((room, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -2 }}
              className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-100 dark:border-blue-800"
            >
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">{room.name}</p>
              <p className="text-sm font-bold text-zinc-900 dark:text-white mt-1">
                {room.area} {room.unit}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {zoom > 1 && (
        <p className="text-xs text-zinc-400 dark:text-zinc-500">Drag to pan across the floor plan</p>
      )}
    </motion.div>
  );
}
