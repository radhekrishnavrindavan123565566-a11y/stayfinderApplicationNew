"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/utils/cn";
import WhyThisProperty from "./WhyThisProperty";

interface Breakdown {
  budget: number;
  bedrooms: number;
  amenities: number;
  location: number;
  tenantType: number;
}

interface MatchData {
  score: number;
  reasons: string[];
  tags: string[];
  breakdown: Breakdown;
}

interface MatchScoreBadgeProps {
  propertyId: string;
}

export default function MatchScoreBadge({ propertyId }: MatchScoreBadgeProps) {
  const { accessToken, user } = useAuthStore();
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!user || !accessToken) return;
    axios
      .get(`/api/properties/${propertyId}/match-score`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((res) => setMatchData(res.data.data))
      .catch(() => {});
  }, [propertyId, accessToken, user]);

  if (!matchData || !user) return null;

  const { score } = matchData;
  const colorClass =
    score >= 70
      ? "bg-green-100 text-green-700 border-green-200"
      : score >= 40
      ? "bg-yellow-100 text-yellow-700 border-yellow-200"
      : "bg-red-100 text-red-700 border-red-200";

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="flex items-center gap-1"
      >
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border",
            colorClass
          )}
        >
          {score}% Match
        </span>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowModal(true);
          }}
          className="text-xs text-zinc-400 hover:text-zinc-600 underline transition-colors"
        >
          Why?
        </button>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <WhyThisProperty
            score={matchData.score}
            reasons={matchData.reasons}
            tags={matchData.tags}
            breakdown={matchData.breakdown}
            onClose={() => setShowModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
