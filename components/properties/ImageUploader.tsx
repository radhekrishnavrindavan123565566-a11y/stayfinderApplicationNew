"use client";
import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, ImageIcon, Star } from "lucide-react";
import Image from "next/image";
import axios from "axios";
import { useApi } from "@/hooks/useApi";
import toast from "react-hot-toast";

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImageUploader({ images, onChange, maxImages = 10 }: ImageUploaderProps) {
  const { authHeaders } = useApi();
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState<number[]>([]);

  const uploadFile = useCallback(async (file: File, index: number) => {
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const base64 = ev.target?.result as string;
        try {
          const { data } = await axios.post("/api/upload", { image: base64 }, authHeaders());
          resolve(data.data.url);
        } catch {
          resolve(base64); // fallback to base64 preview
        }
      };
      reader.readAsDataURL(file);
    });
  }, [authHeaders]);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files) return;
    const remaining = maxImages - images.length;
    if (remaining <= 0) { toast.error(`Max ${maxImages} images allowed`); return; }
    const toUpload = Array.from(files).slice(0, remaining);
    const indices = toUpload.map((_, i) => images.length + i);
    setUploading(indices);
    try {
      const urls = await Promise.all(toUpload.map((f, i) => uploadFile(f, i)));
      onChange([...images, ...urls]);
    } finally {
      setUploading([]);
    }
  }, [images, maxImages, onChange, uploadFile]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const removeImage = (idx: number) => onChange(images.filter((_, i) => i !== idx));
  const setMain = (idx: number) => {
    const reordered = [...images];
    const [main] = reordered.splice(idx, 1);
    onChange([main, ...reordered]);
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <motion.label
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        animate={{ borderColor: dragging ? "#f43f5e" : "#e4e4e7", backgroundColor: dragging ? "#fff1f2" : "#fafafa" }}
        className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-2xl cursor-pointer transition-colors"
      >
        <motion.div animate={{ scale: dragging ? 1.15 : 1 }} transition={{ type: "spring", stiffness: 300 }}>
          <Upload className={`w-7 h-7 mb-2 mx-auto ${dragging ? "text-rose-500" : "text-zinc-400"}`} />
        </motion.div>
        <p className="text-sm text-zinc-500">
          {dragging ? "Drop images here" : "Drag & drop or click to upload"}
        </p>
        <p className="text-xs text-zinc-400 mt-1">{images.length}/{maxImages} images • JPG, PNG, WEBP</p>
        <input type="file" multiple accept="image/*" className="hidden"
          onChange={(e) => handleFiles(e.target.files)} />
      </motion.label>

      {/* Preview Grid */}
      <AnimatePresence>
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 sm:grid-cols-5 gap-3"
          >
            {images.map((img, i) => (
              <motion.div
                key={img + i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: i * 0.04 }}
                className="relative aspect-square rounded-xl overflow-hidden group border-2 border-transparent hover:border-rose-400 transition-all"
              >
                <Image src={img} alt={`img-${i}`} fill className="object-cover" />
                {i === 0 && (
                  <div className="absolute top-1 left-1 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5" /> Main
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {i !== 0 && (
                    <button type="button" onClick={() => setMain(i)}
                      className="w-7 h-7 bg-white/90 rounded-full flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors"
                      title="Set as main">
                      <Star className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button type="button" onClick={() => removeImage(i)}
                    className="w-7 h-7 bg-white/90 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
            {/* Upload slots */}
            {uploading.map((idx) => (
              <div key={`uploading-${idx}`} className="aspect-square rounded-xl bg-zinc-100 flex items-center justify-center border-2 border-dashed border-zinc-200">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                  <ImageIcon className="w-5 h-5 text-zinc-400" />
                </motion.div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
