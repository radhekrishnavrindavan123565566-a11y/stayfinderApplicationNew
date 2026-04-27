"use client";
import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Maximize2, Info } from "lucide-react";
import axios from "axios";
import { useApi } from "@/hooks/useApi";
import toast from "react-hot-toast";

interface Props {
  images: string[];
  onChange: (images: string[]) => void;
}

export default function Tour360Uploader({ images, onChange }: Props) {
  const { authHeaders } = useApi();
  const [uploading, setUploading] = useState(false);

  const upload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = 8 - images.length;
    if (remaining <= 0) { toast.error("Max 8 rooms allowed"); return; }
    const toUpload = Array.from(files).slice(0, remaining);
    setUploading(true);
    try {
      const urls = await Promise.all(toUpload.map(async (file) => {
        const img = new window.Image();
        const objectUrl = URL.createObjectURL(file);
        await new Promise((res) => { img.onload = res; img.src = objectUrl; });
        URL.revokeObjectURL(objectUrl);
        // Compress
        const canvas = document.createElement("canvas");
        const MAX = 2048;
        const scale = img.width > MAX ? MAX / img.width : 1;
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL("image/jpeg", 0.8);
        try {
          const { data } = await axios.post("/api/upload", { image: base64, folder: "tour360" }, authHeaders());
          return data.data.url as string;
        } catch {
          return base64;
        }
      }));
      onChange([...images, ...urls]);
      toast.success(`${urls.length} 360° photo${urls.length > 1 ? "s" : ""} uploaded`);
    } finally {
      setUploading(false);
    }
  }, [images, onChange, authHeaders]);

  const remove = (idx: number) => onChange(images.filter((_, i) => i !== idx));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Maximize2 className="w-4 h-4 text-indigo-500" />
        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          360° Virtual Tour <span className="text-zinc-400 text-xs font-normal">(optional · max 8 rooms)</span>
        </p>
      </div>

      <div className="flex items-start gap-2 text-xs text-zinc-500 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 rounded-xl px-3 py-2">
        <Info className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
        Use wide-angle or panoramic photos for best effect. Tenants can drag to look around in 360°.
      </div>

      {/* Upload zone */}
      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-indigo-200 dark:border-indigo-800 rounded-2xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-colors">
        {uploading ? (
          <div className="flex items-center gap-2 text-indigo-500">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full" />
            <span className="text-sm">Uploading…</span>
          </div>
        ) : (
          <>
            <Upload className="w-6 h-6 text-indigo-400 mb-1" />
            <p className="text-sm text-zinc-500">Upload wide-angle / panoramic photos</p>
            <p className="text-xs text-zinc-400">{images.length}/8 rooms</p>
          </>
        )}
        <input type="file" multiple accept="image/*" className="hidden"
          onChange={(e) => upload(e.target.files)} />
      </label>

      {/* Preview grid */}
      <AnimatePresence>
        {images.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-4 gap-2">
            {images.map((img, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }} className="relative aspect-video rounded-xl overflow-hidden group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt={`360 room ${i + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button type="button" onClick={() => remove(i)}
                    className="w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="absolute bottom-1 left-1 text-[9px] bg-black/60 text-white px-1.5 py-0.5 rounded-md">
                  Room {i + 1}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
