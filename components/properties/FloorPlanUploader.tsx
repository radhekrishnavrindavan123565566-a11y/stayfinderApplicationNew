"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Plus, Trash2, AlertCircle } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import axios from "axios";
import toast from "react-hot-toast";

interface FloorPlanData {
  imageUrl?: string;
  totalArea?: number;
  rooms?: Array<{ name: string; area: number; unit: "sqm" | "sqft" }>;
}

interface FloorPlanUploaderProps {
  value: FloorPlanData | undefined;
  onChange: (data: FloorPlanData) => void;
  propertyId: string;
}

export default function FloorPlanUploader({
  value,
  onChange,
  propertyId,
}: FloorPlanUploaderProps) {
  const { authHeaders } = useApi();
  const [uploading, setUploading] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: "", area: 0, unit: "sqm" as const });
  const [showRoomForm, setShowRoomForm] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const base64 = evt.target?.result as string;
        const { data } = await axios.post(
          "/api/upload",
          { image: base64, folder: "floor-plans" },
          authHeaders()
        );

        onChange({
          ...value,
          imageUrl: data.data.url,
        });

        toast.success("Floor plan uploaded successfully");
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error("Failed to upload floor plan");
    } finally {
      setUploading(false);
    }
  };

  const handleAddRoom = () => {
    if (!newRoom.name.trim() || newRoom.area <= 0) {
      toast.error("Please enter room name and area");
      return;
    }

    const rooms = [...(value?.rooms || []), newRoom];
    onChange({
      ...value,
      rooms,
      totalArea: (value?.totalArea || 0) + newRoom.area,
    });

    setNewRoom({ name: "", area: 0, unit: "sqm" });
    setShowRoomForm(false);
    toast.success("Room added");
  };

  const handleRemoveRoom = (idx: number) => {
    const room = value?.rooms?.[idx];
    const rooms = value?.rooms?.filter((_, i) => i !== idx) || [];

    onChange({
      ...value,
      rooms,
      totalArea: (value?.totalArea || 0) - (room?.area || 0),
    });
  };

  return (
    <div className="space-y-4 p-4 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20 rounded-xl">
      <div>
        <label className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2 mb-2">
          📐 Floor Plan (Optional)
        </label>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
          Add floor plan image and room dimensions
        </p>
      </div>

      {/* Image upload */}
      <div>
        {value?.imageUrl ? (
          <div className="relative w-full h-40 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value.imageUrl}
              alt="Floor plan"
              className="w-full h-full object-cover"
            />
            <button
              onClick={() =>
                onChange({
                  ...value,
                  imageUrl: undefined,
                  rooms: [],
                  totalArea: 0,
                })
              }
              className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="block p-6 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-600 cursor-pointer transition-colors bg-blue-50/50 dark:bg-zinc-900/50">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center gap-2">
              <Upload className="w-6 h-6 text-blue-500" />
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                {uploading ? "Uploading..." : "Click to upload floor plan"}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                PNG, JPG or SVG (max 5MB)
              </p>
            </div>
          </label>
        )}
      </div>

      {/* Total area */}
      {value?.imageUrl && (
        <div>
          <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase block mb-1">
            Total Area (Optional)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              value={value?.totalArea || ""}
              onChange={(e) =>
                onChange({
                  ...value,
                  totalArea: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              placeholder="e.g., 1200"
              className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400"
            />
            <select className="px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 text-sm text-zinc-900 dark:text-white">
              <option>sqm</option>
              <option>sqft</option>
            </select>
          </div>
        </div>
      )}

      {/* Rooms */}
      {value?.imageUrl && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase">
              Rooms ({value?.rooms?.length || 0})
            </label>
            {!showRoomForm && (
              <button
                onClick={() => setShowRoomForm(true)}
                className="p-1 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-950 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Room list */}
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {value?.rooms?.map((room, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-2 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700"
              >
                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                  {room.name} — {room.area} {room.unit}
                </span>
                <button
                  onClick={() => handleRemoveRoom(idx)}
                  className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </div>

          {/* Add room form */}
          {showRoomForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="p-3 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-300 dark:border-zinc-600 space-y-2"
            >
              <input
                type="text"
                placeholder="Room name (e.g., Master Bedroom)"
                value={newRoom.name}
                onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                className="w-full px-2 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  placeholder="Area"
                  value={newRoom.area || ""}
                  onChange={(e) =>
                    setNewRoom({ ...newRoom, area: Number(e.target.value) })
                  }
                  className="flex-1 px-2 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400"
                />
                <select
                  value={newRoom.unit}
                  onChange={(e) =>
                    setNewRoom({
                      ...newRoom,
                      unit: e.target.value as "sqm" | "sqft",
                    })
                  }
                  className="px-2 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white"
                >
                  <option>sqm</option>
                  <option>sqft</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddRoom}
                  className="flex-1 px-2 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium transition-colors"
                >
                  Add Room
                </button>
                <button
                  onClick={() => {
                    setShowRoomForm(false);
                    setNewRoom({ name: "", area: 0, unit: "sqm" });
                  }}
                  className="flex-1 px-2 py-1.5 rounded-lg bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-600 text-zinc-900 dark:text-white text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Info box */}
      <div className="flex gap-2 p-2 bg-blue-100/50 dark:bg-blue-900/20 rounded-lg">
        <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-600 dark:text-blue-400">
          Floor plans help tenants understand property layout and dimensions
        </p>
      </div>
    </div>
  );
}
