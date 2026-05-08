"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Star,
  MessageSquare,
  TrendingUp,
  Shield,
  Zap,
  Home,
  ThumbsUp,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";

interface LocalityReview {
  _id: string;
  locality: string;
  city: string;
  ratings: {
    safety: number;
    connectivity: number;
    amenities: number;
    cleanliness: number;
    overall: number;
  };
  comment: string;
  reviewer: { username: string };
  createdAt: string;
}

interface LocalityQA {
  _id: string;
  locality: string;
  city: string;
  question: string;
  answers: Array<{
    _id: string;
    answer: string;
    author: { username: string };
    upvotes: number;
    createdAt: string;
  }>;
  author: { username: string };
  createdAt: string;
}

const CITIES = ["Prayagraj", "Lucknow", "Kanpur", "Varanasi", "Noida", "Agra"];

export default function CommunityPage() {
  const [selectedCity, setSelectedCity] = useState("Prayagraj");
  const [reviews, setReviews] = useState<LocalityReview[]>([]);
  const [questions, setQuestions] = useState<LocalityQA[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"reviews" | "qa">("reviews");

  const fetchCommunityData = useCallback(async () => {
    setLoading(true);
    try {
      const [reviewsRes, qaRes] = await Promise.all([
        axios.get(`/api/community/locality-reviews?city=${selectedCity}`),
        axios.get(`/api/community/locality-qa?city=${selectedCity}`),
      ]);
      setReviews(reviewsRes.data.data || []);
      setQuestions(qaRes.data.data || []);
    } catch (error) {
      console.error("Failed to fetch community data:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedCity]);

  useEffect(() => {
    fetchCommunityData();
  }, [fetchCommunityData]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "fill-amber-400 text-amber-400"
                : "text-zinc-300 dark:text-zinc-600"
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-20 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white mb-2">
            Community Insights
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Learn about neighborhoods from people who live there
          </p>
        </motion.div>

        {/* City Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex flex-wrap gap-2">
            {CITIES.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                  selectedCity === city
                    ? "bg-emerald-500 text-white"
                    : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-300 dark:hover:border-emerald-700"
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setActiveTab("reviews")}
              className={`px-4 py-3 font-semibold text-sm transition-all relative ${
                activeTab === "reviews"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              <Star className="w-4 h-4 inline mr-2" />
              Reviews
              {activeTab === "reviews" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab("qa")}
              className={`px-4 py-3 font-semibold text-sm transition-all relative ${
                activeTab === "qa"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Q&A
              {activeTab === "qa" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"
                />
              )}
            </button>
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-rose-500 border-t-transparent" />
          </div>
        ) : activeTab === "reviews" ? (
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <div className="text-6xl mb-4">⭐</div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                  No reviews yet
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 mb-6">
                  Be the first to review a locality in {selectedCity}
                </p>
              </div>
            ) : (
              reviews.map((review, index) => (
                <motion.div
                  key={review._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-zinc-900 dark:text-white text-lg mb-1">
                        {review.locality}
                      </h3>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        by {review.reviewer.username} • {formatDate(review.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {renderStars(review.ratings.overall)}
                      <span className="text-sm font-bold text-zinc-900 dark:text-white">
                        {review.ratings.overall.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <p className="text-zinc-700 dark:text-zinc-300 mb-4">
                    {review.comment}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-500" />
                      <div>
                        <p className="text-xs text-zinc-500">Safety</p>
                        <p className="text-sm font-bold text-zinc-900 dark:text-white">
                          {review.ratings.safety}/5
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <div>
                        <p className="text-xs text-zinc-500">Connectivity</p>
                        <p className="text-sm font-bold text-zinc-900 dark:text-white">
                          {review.ratings.connectivity}/5
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4 text-green-500" />
                      <div>
                        <p className="text-xs text-zinc-500">Amenities</p>
                        <p className="text-sm font-bold text-zinc-900 dark:text-white">
                          {review.ratings.amenities}/5
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-purple-500" />
                      <div>
                        <p className="text-xs text-zinc-500">Cleanliness</p>
                        <p className="text-sm font-bold text-zinc-900 dark:text-white">
                          {review.ratings.cleanliness}/5
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {questions.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                  No questions yet
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 mb-6">
                  Be the first to ask about {selectedCity}
                </p>
              </div>
            ) : (
              questions.map((qa, index) => (
                <motion.div
                  key={qa._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800"
                >
                  <div className="mb-4">
                    <div className="flex items-start gap-3 mb-2">
                      <MessageSquare className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-bold text-zinc-900 dark:text-white text-lg mb-1">
                          {qa.question}
                        </h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          {qa.locality} • by {qa.author.username} •{" "}
                          {formatDate(qa.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {qa.answers.length > 0 && (
                    <div className="space-y-3 pl-8 border-l-2 border-zinc-200 dark:border-zinc-800">
                      {qa.answers.map((answer) => (
                        <div
                          key={answer._id}
                          className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4"
                        >
                          <p className="text-zinc-700 dark:text-zinc-300 mb-2">
                            {answer.answer}
                          </p>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-zinc-500">
                              by {answer.author.username} •{" "}
                              {formatDate(answer.createdAt)}
                            </p>
                            <button className="flex items-center gap-1 text-xs text-zinc-500 hover:text-emerald-600 transition-colors">
                              <ThumbsUp className="w-3 h-3" />
                              {answer.upvotes}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {qa.answers.length === 0 && (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 pl-8">
                      No answers yet. Be the first to answer!
                    </p>
                  )}
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
