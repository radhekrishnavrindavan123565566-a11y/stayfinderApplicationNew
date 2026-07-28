"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, Save, X } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

interface AutoReply {
  _id?: string;
  title: string;
  message: string;
  isActive: boolean;
}

export function AutomatedReplies() {
  const [replies, setReplies] = useState<AutoReply[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AutoReply>({
    title: "",
    message: "",
    isActive: true,
  });

  useEffect(() => {
    fetchReplies();
  }, []);

  const fetchReplies = async () => {
    try {
      const { data } = await axios.get("/api/settings/auto-replies");
      setReplies(data.data || []);
    } catch (error) {
      // Silently fail - feature not yet implemented on backend
      setReplies([]);
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      // For now, store locally in state
      // Backend API: /api/settings/auto-replies
      if (editingId) {
        setReplies(
          replies.map((r) => (r._id === editingId ? { ...formData, _id: editingId } : r))
        );
        toast.success("Auto-reply updated!");
      } else {
        const newReply = { ...formData, _id: Date.now().toString() };
        setReplies([...replies, newReply]);
        toast.success("Auto-reply created!");
      }
      resetForm();
    } catch (error) {
      toast.error("Failed to save auto-reply");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this auto-reply?")) return;

    try {
      // Backend API: /api/settings/auto-replies/{id}
      // For now, delete from state
      setReplies(replies.filter((r) => r._id !== id));
      toast.success("Auto-reply deleted!");
    } catch (error) {
      toast.error("Failed to delete auto-reply");
    }
  };

  const handleEdit = (reply: AutoReply) => {
    setFormData(reply);
    setEditingId(reply._id || null);
  };

  const resetForm = () => {
    setFormData({ title: "", message: "", isActive: true });
    setEditingId(null);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Automated Replies
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
          Set up automatic responses for common inquiries
        </p>
      </div>

      {/* Add/Edit Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800/50 space-y-4"
      >
        {/* Title */}
        <div>
          <label className="text-sm font-medium text-zinc-900 dark:text-white">
            Reply Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Availability Question"
            className="w-full mt-2 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Message */}
        <div>
          <label className="text-sm font-medium text-zinc-900 dark:text-white">
            Auto Reply Message
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Your automatic reply message..."
            rows={4}
            className="w-full mt-2 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Active Toggle */}
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm font-medium text-zinc-900 dark:text-white">
              Active
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {editingId ? "Update" : "Create"} Reply
              </>
            )}
          </motion.button>
          {editingId && (
            <button
              onClick={resetForm}
              className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>

      {/* Existing Replies */}
      <div className="space-y-3">
        <h3 className="font-semibold text-zinc-900 dark:text-white">
          Your Auto-Replies ({replies.length})
        </h3>

        <AnimatePresence>
          {replies.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-zinc-500 dark:text-zinc-400 py-8 text-center"
            >
              No auto-replies yet. Create one above!
            </motion.p>
          ) : (
            replies.map((reply, index) => (
              <motion.div
                key={reply._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-zinc-900 dark:text-white">
                        {reply.title}
                      </h4>
                      {reply.isActive && (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">
                      {reply.message}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(reply)}
                    className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(reply._id!)}
                    className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
