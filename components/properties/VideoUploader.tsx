"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Video, Upload, X, CheckCircle, AlertCircle, Home, MapPin } from "lucide-react";
import axios from "axios";
import { useApi } from "@/hooks/useApi";
import toast from "react-hot-toast";

export interface PropertyVideos {
  interior?: string;
  exterior?: string;
}

interface VideoUploaderProps {
  videos: PropertyVideos;
  onChange: (videos: PropertyVideos) => void;
}

const SLOTS = [
  {
    key: "interior" as const,
    label: "Interior Video",
    hint: "Walk through every room inside the house",
    icon: <Home className="w-5 h-5" />,
    color: "from-blue-500 to-indigo-500",
    bg: "bg-blue-50 dark:bg-blue-950/20",
    border: "border-blue-200 dark:border-blue-800",
    iconBg: "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400",
  },
  {
    key: "exterior" as const,
    label: "Exterior / Road-side Video",
    hint: "Show the building front, gate & surroundings",
    icon: <MapPin className="w-5 h-5" />,
    color: "from-rose-500 to-pink-500",
    bg: "bg-rose-50 dark:bg-rose-950/20",
    border: "border-rose-200 dark:border-rose-800",
    iconBg: "bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400",
  },
];

const MAX_MB = 100;

export default function VideoUploader({ videos, onChange }: VideoUploaderProps) {
  const { authHeaders } = useApi();
  const [uploading, setUploading] = useState<{ interior: boolean; exterior: boolean }>({ interior: false, exterior: false });
  const [progress, setProgress] = useState<{ interior: number; exterior: number }>({ interior: 0, exterior: 0 });
  const inputRefs = { interior: useRef<HTMLInputElement>(null), exterior: useRef<HTMLInputElement>(null) };
  const videosRef = useRef(videos);
  useEffect(() => { videosRef.current = videos; }, [videos]);

  const upload = useCallback(async (key: "interior" | "exterior", file: File) => {
    if (!file.type.startsWith("video/")) { toast.error("Please select a video file"); return; }
    if (file.size > MAX_MB * 1024 * 1024) { toast.error(`Video must be under ${MAX_MB}MB`); return; }

    setUploading((p) => ({ ...p, [key]: true }));
    setProgress((p) => ({ ...p, [key]: 0 }));

    const form = new FormData();
    form.append("file", file);
    form.append("folder", "videos");

    try {
      const { headers } = authHeaders();
      const { data } = await axios.post("/api/upload", form, {
        headers: { ...(headers as Record<string, string>) },
        onUploadProgress: (e) => {
          const pct = Math.round((e.loaded * 100) / (e.total ?? 1));
          setProgress((p) => ({ ...p, [key]: pct }));
        },
      });
      onChange({ ...videosRef.current, [key]: data.data.url });
      toast.success(`${key === "interior" ? "Interior" : "Exterior"} video uploaded`);
    } catch (err) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error || err.message : "Upload failed";
      toast.error(msg);
    } finally {
      setUploading((p) => ({ ...p, [key]: false }));
      setProgress((p) => ({ ...p, [key]: 0 }));
    }
  }, [authHeaders, onChange]);

  const remove = (key: "interior" | "exterior") => onChange({ ...videos, [key]: undefined });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Video className="w-4 h-4 text-zinc-500" />
        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Property Videos <span className="text-zinc-400 text-xs font-normal">(optional)</span>
        </p>
        <span className="text-xs text-zinc-400">max {MAX_MB}MB · any format</span>
      </div>

      {SLOTS.map((slot) => {
        const url = videos[slot.key];
        const isUploading = uploading[slot.key];
        const pct = progress[slot.key];
        const done = !!url;

        return (
          <motion.div key={slot.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl border-2 ${done ? "border-green-400 dark:border-green-600" : slot.border} ${slot.bg} p-4 transition-colors`}>
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${slot.iconBg}`}>
                {slot.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{slot.label}</p>
                  {done && <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">{slot.hint}</p>

                <AnimatePresence mode="wait">
                  {done && (
                    <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <video src={url} controls className="w-full max-h-40 rounded-xl bg-black" preload="metadata" />
                      <button type="button" onClick={() => remove(slot.key)}
                        className="mt-2 flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition-colors">
                        <X className="w-3.5 h-3.5" /> Remove
                      </button>
                    </motion.div>
                  )}
                  {isUploading && (
                    <motion.div key="progress" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                      <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                        <motion.div className={`h-full bg-gradient-to-r ${slot.color} rounded-full`}
                          animate={{ width: `${pct}%` }} transition={{ ease: "linear" }} />
                      </div>
                      <p className="text-xs text-zinc-500">Uploading… {pct}%</p>
                    </motion.div>
                  )}
                  {!done && !isUploading && (
                    <motion.label key="dropzone" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-3 cursor-pointer group">
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r ${slot.color} text-white text-sm font-medium shadow-sm hover:opacity-90 transition-opacity`}>
                        <Upload className="w-4 h-4" /> Choose Video
                      </div>
                      <span className="text-xs text-zinc-400 group-hover:text-zinc-600 transition-colors">or drag & drop</span>
                      <input ref={inputRefs[slot.key]} type="file" accept="video/*" className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(slot.key, f); e.target.value = ""; }} />
                    </motion.label>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        );
      })}

      {(!videos.interior && !videos.exterior) && (
        <p className="text-xs text-zinc-400 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5" />
          Videos are optional but help tenants make faster decisions
        </p>
      )}
    </div>
  );
}
