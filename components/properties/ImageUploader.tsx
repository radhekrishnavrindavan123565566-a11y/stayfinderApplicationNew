"use client";
import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, ImageIcon, Star, Tag } from "lucide-react";
import Image from "next/image";
import axios from "axios";
import { useApi } from "@/hooks/useApi";
import toast from "react-hot-toast";

const IMAGE_CATEGORIES = [
  "Main",
  "Living Room",
  "Bedroom",
  "Kitchen",
  "Bathroom",
  "Road Side View",
  "Exterior",
  "Other",
] as const;

type ImageCategory = typeof IMAGE_CATEGORIES[number];

interface ImageEntry {
  url: string;
  category: ImageCategory;
}

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImageUploader({ images, onChange, maxImages = 10 }: ImageUploaderProps) {
  const { authHeaders } = useApi();
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState<number[]>([]);
  const [categories, setCategories] = useState<ImageCategory[]>(() =>
    images.map((_, i) => (i === 0 ? "Main" : "Other"))
  );
  const [editingCategory, setEditingCategory] = useState<number | null>(null);

  const uploadFile = useCallback(async (file: File) => {
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const base64 = ev.target?.result as string;
        try {
          const { data } = await axios.post("/api/upload", { image: base64 }, authHeaders());
          resolve(data.data.url);
        } catch {
          resolve(base64);
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
      const urls = await Promise.all(toUpload.map((f) => uploadFile(f)));
      onChange([...images, ...urls]);
      setCategories((prev) => [
        ...prev,
        ...urls.map((_, i) => (images.length + i === 0 ? "Main" : "Other") as ImageCategory),
      ]);
    } finally {
      setUploading([]);
    }
  }, [images, maxImages, onChange, uploadFile]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const removeImage = (idx: number) => {
    onChange(images.filter((_, i) => i !== idx));
    setCategories((prev) => prev.filter((_, i) => i !== idx));
  };

  const setMain = (idx: number) => {
    const reorderedImgs = [...images];
    const reorderedCats = [...categories];
    const [mainImg] = reorderedImgs.splice(idx, 1);
    const [mainCat] = reorderedCats.splice(idx, 1);
    onChange([mainImg, ...reorderedImgs]);
    setCategories(["Main", ...reorderedCats.map((c) => (c === "Main" ? "Other" : c))]);
  };

  const updateCategory = (idx: number, cat: ImageCategory) => {
    setCategories((prev) => prev.map((c, i) => (i === idx ? cat : c)));
    setEditingCategory(null);
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

      {/* Category hint */}
      {images.length > 0 && (
        <p className="text-xs text-zinc-400 flex items-center gap-1">
          <Tag className="w-3 h-3" /> Click the tag icon on any image to set its category (e.g. Road Side View)
        </p>
      )}

      {/* Preview Grid */}
      <AnimatePresence>
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 sm:grid-cols-4 gap-3"
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

                {/* Category badge */}
                <div className="absolute bottom-1 left-1 right-1">
                  <div className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md text-center truncate ${
                    i === 0 ? "bg-rose-500 text-white" :
                    categories[i] === "Road Side View" ? "bg-blue-500 text-white" :
                    "bg-black/60 text-white"
                  }`}>
                    {i === 0 ? "Main" : (categories[i] || "Other")}
                  </div>
                </div>

                {/* Hover actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                  {i !== 0 && (
                    <button type="button" onClick={() => setMain(i)}
                      className="w-7 h-7 bg-white/90 rounded-full flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors"
                      title="Set as main">
                      <Star className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button type="button" onClick={() => setEditingCategory(editingCategory === i ? null : i)}
                    className="w-7 h-7 bg-white/90 rounded-full flex items-center justify-center hover:bg-blue-500 hover:text-white transition-colors"
                    title="Set category">
                    <Tag className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => removeImage(i)}
                    className="w-7 h-7 bg-white/90 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Category picker dropdown */}
                <AnimatePresence>
                  {editingCategory === i && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 4 }}
                      className="absolute inset-x-0 bottom-0 bg-white dark:bg-zinc-800 rounded-b-xl shadow-xl z-10 p-1.5 space-y-0.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {IMAGE_CATEGORIES.filter((c) => c !== "Main").map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => updateCategory(i, cat)}
                          className={`w-full text-left text-[10px] px-2 py-1 rounded-lg transition-colors font-medium ${
                            categories[i] === cat
                              ? "bg-rose-500 text-white"
                              : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}

            {/* Uploading slots */}
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
