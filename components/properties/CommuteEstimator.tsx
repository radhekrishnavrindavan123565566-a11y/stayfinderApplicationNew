"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Navigation2, Clock, MapPin, Trash2, Plus } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

interface CommuteDestination {
  id: string;
  name: string;
  address: string;
  times: {
    driving?: number;
    transit?: number;
    walking?: number;
    cycling?: number;
  };
  loading?: boolean;
}

interface CommuteEstimatorProps {
  propertyLocation: { address: string; city: string; lat?: number; lng?: number };
  propertyTitle: string;
}

const TRANSPORT_MODES = [
  { key: "driving", label: "Driving", icon: "🚗", color: "from-blue-500" },
  { key: "transit", label: "Transit", icon: "🚌", color: "from-purple-500" },
  { key: "walking", label: "Walking", icon: "🚶", color: "from-green-500" },
  { key: "cycling", label: "Cycling", icon: "🚴", color: "from-yellow-500" },
];

export default function CommuteEstimator({
  propertyLocation,
  propertyTitle,
}: CommuteEstimatorProps) {
  const [destinations, setDestinations] = useState<CommuteDestination[]>([]);
  const [newDestName, setNewDestName] = useState("");
  const [newDestAddress, setNewDestAddress] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const calculateCommute = useCallback(
    async (destination: CommuteDestination) => {
      if (!propertyLocation.lat || !propertyLocation.lng) {
        toast.error("Property coordinates not available");
        return;
      }

      setDestinations((d) =>
        d.map((dest) =>
          dest.id === destination.id ? { ...dest, loading: true } : dest
        )
      );

      try {
        const { data } = await axios.post("/api/properties/commute-times", {
          origin: propertyLocation,
          destination: { address: destination.address },
          modes: ["driving", "transit", "walking", "cycling"],
        });

        setDestinations((d) =>
          d.map((dest) =>
            dest.id === destination.id
              ? { ...dest, times: data.data.times, loading: false }
              : dest
          )
        );
      } catch (error) {
        toast.error("Failed to calculate commute time");
        setDestinations((d) =>
          d.map((dest) =>
            dest.id === destination.id ? { ...dest, loading: false } : dest
          )
        );
      }
    },
    [propertyLocation]
  );

  const addDestination = async () => {
    if (!newDestName.trim() || !newDestAddress.trim()) {
      toast.error("Please enter destination name and address");
      return;
    }

    if (destinations.length >= 5) {
      toast.error("Maximum 5 destinations allowed");
      return;
    }

    const newDest: CommuteDestination = {
      id: Date.now().toString(),
      name: newDestName,
      address: newDestAddress,
      times: {},
      loading: true,
    };

    setDestinations([...destinations, newDest]);
    setNewDestName("");
    setNewDestAddress("");
    setIsAdding(false);

    await calculateCommute(newDest);
  };

  const removeDestination = (id: string) => {
    setDestinations(destinations.filter((d) => d.id !== id));
  };

  const formatTime = (minutes?: number) => {
    if (!minutes) return "—";
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6"
    >
      <div>
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white text-sm">
            🗺️
          </span>
          Commute Times
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Estimate commute from {propertyTitle}
        </p>
      </div>

      {/* Add destination form */}
      {!isAdding ? (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsAdding(true)}
          disabled={destinations.length >= 5}
          className="w-full p-3 rounded-lg border-2 border-dashed border-zinc-200 dark:border-zinc-700 hover:border-orange-400 dark:hover:border-orange-500 text-zinc-600 dark:text-zinc-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Destination
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg space-y-3"
        >
          <input
            type="text"
            placeholder="Destination name (e.g., Work, School)"
            value={newDestName}
            onChange={(e) => setNewDestName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400"
          />
          <input
            type="text"
            placeholder="Address or location"
            value={newDestAddress}
            onChange={(e) => setNewDestAddress(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400"
          />
          <div className="flex gap-2">
            <button
              onClick={addDestination}
              className="flex-1 px-3 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm transition-colors"
            >
              Calculate
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewDestName("");
                setNewDestAddress("");
              }}
              className="flex-1 px-3 py-2 rounded-lg bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-900 dark:text-white font-medium text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Destinations list */}
      <div className="space-y-3">
        {destinations.map((dest) => (
          <motion.div
            key={dest.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 border border-zinc-100 dark:border-zinc-800 rounded-lg space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-zinc-900 dark:text-white truncate">
                  {dest.name}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate flex items-center gap-1">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  {dest.address}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => removeDestination(dest.id)}
                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 transition-colors flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Commute times grid */}
            {dest.loading ? (
              <div className="h-20 bg-zinc-50 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {TRANSPORT_MODES.map((mode) => (
                  <motion.div
                    key={mode.key}
                    whileHover={{ y: -2 }}
                    className={`p-3 rounded-lg bg-gradient-to-br ${mode.color} to-transparent bg-opacity-10 border border-opacity-20 border-zinc-200 dark:border-zinc-700`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{mode.icon}</span>
                      <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase">
                        {mode.label}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(
                        dest.times[mode.key as keyof typeof dest.times]
                      )}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {destinations.length === 0 && !isAdding && (
        <p className="text-center text-sm text-zinc-400 dark:text-zinc-500 py-4">
          Add a destination to calculate commute times
        </p>
      )}
    </motion.div>
  );
}
