"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, Copy, Check } from "lucide-react";
import axios from "axios";
import { useApi } from "@/hooks/useApi";
import toast from "react-hot-toast";

interface Props {
  title: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  city: string;
  onGenerated: (description: string) => void;
}

export default function AIDescriptionGenerator({ title, propertyType, bedrooms, bathrooms, amenities, city, onGenerated }: Props) {
  const { authHeaders } = useApi();
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!title) { toast.error("Enter a property title first"); return; }
    setLoading(true);
    try {
      const { data } = await axios.post("/api/ai/generate-description", {
        title, propertyType, bedrooms, bathrooms, amenities, city,
      }, authHeaders());
      setGenerated(data.data.description);
    } catch {
      toast.error("AI generation failed");
    } finally {
      setLoading(false);
    }
  };

  const use = () => {
    onGenerated(generated);
    toast.success("Description applied!");
  };

  const copy = async () => {
    await navigator.clipboard.writeText(generated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2">
      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={generate}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        {loading ? "Generating..." : "Generate with AI"}
      </motion.button>

      <AnimatePresence>
        {generated && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="bg-gradient-to-br from-rose-50 to-purple-50 dark:from-rose-900/20 dark:to-purple-900/20 rounded-xl border border-rose-200 dark:border-rose-800 p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI Generated
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={copy}
                  className="text-xs text-zinc-500 hover:text-zinc-700 flex items-center gap-1 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  type="button"
                  onClick={use}
                  className="text-xs bg-rose-500 text-white px-2 py-0.5 rounded-lg hover:bg-rose-600 transition-colors"
                >
                  Use this
                </button>
              </div>
            </div>
            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{generated}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
