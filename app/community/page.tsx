"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Star,
  MessageSquare,
  TrendingUp,
  Shield,
  Zap,
  Home,
  ThumbsUp,
  Plus,
  X,
  Send,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
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
  const { user, accessToken } = useAuthStore();
  const [selectedCity, setSelectedCity] = useState("Prayagraj");
  const [reviews, setReviews] = useState<LocalityReview[]>([]);
  const [questions, setQuestions] = useState<LocalityQA[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"reviews" | "qa">("reviews");
  
  // Modals
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  
  // Review form
  const [locality, setLocality] = useState("");
  const [ratings, setRatings] = useState({
    safety: 0,
    connectivity: 0,
    amenities: 0,
    cleanliness: 0,
  });
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // Q&A form
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

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

  const handleSubmitReview = async () => {
    if (!locality || !comment || !accessToken) {
      toast.error("Please fill all fields");
      return;
    }

    const overall = (ratings.safety + ratings.connectivity + ratings.amenities + ratings.cleanliness) / 4;
    if (overall === 0) {
      toast.error("Please provide ratings");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(
        "/api/community/locality-reviews",
        {
          locality,
          city: selectedCity,
          ratings: { ...ratings, overall },
          comment,
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      toast.success("Review submitted successfully!");
      setShowReviewModal(false);
      setLocality("");
      setRatings({ safety: 0, connectivity: 0, amenities: 0, cleanliness: 0 });
      setComment("");
      fetchCommunityData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitQuestion = async () => {
    if (!locality || !question || !accessToken) {
      toast.error("Please fill all fields");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(
        "/api/community/locality-qa",
        {
          locality,
          city: selectedCity,
          question,
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      toast.success("Question posted successfully!");
      setShowQuestionModal(false);
      setLocality("");
      setQuestion("");
      fetchCommunityData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to post question");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer || !selectedQuestion || !accessToken) {
      toast.error("Please write an answer");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(
        `/api/community/locality-qa/${selectedQuestion}/answer`,
        { answer },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      toast.success("Answer posted successfully!");
      setShowAnswerModal(false);
      setAnswer("");
      setSelectedQuestion(null);
      fetchCommunityData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to post answer");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvote = async (questionId: string, answerId: string) => {
    if (!accessToken) {
      toast.error("Please login to upvote");
      return;
    }

    try {
      await axios.post(
        `/api/community/locality-qa/${questionId}/answer/${answerId}/upvote`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      fetchCommunityData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to upvote");
    }
  };

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
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex gap-2">
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
            {user && (
              <Button
                onClick={() => activeTab === "reviews" ? setShowReviewModal(true) : setShowQuestionModal(true)}
                size="sm"
              >
                <Plus className="w-4 h-4" />
                {activeTab === "reviews" ? "Write Review" : "Ask Question"}
              </Button>
            )}
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
                            <button
                              onClick={() => handleUpvote(qa._id, answer._id)}
                              className="flex items-center gap-1 text-xs text-zinc-500 hover:text-emerald-600 transition-colors"
                            >
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

                  {user && (
                    <div className="mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedQuestion(qa._id);
                          setShowAnswerModal(true);
                        }}
                      >
                        <Send className="w-3 h-3" />
                        Answer
                      </Button>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowReviewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-lg w-full border border-zinc-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                  Write a Review
                </h2>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Locality Name
                  </label>
                  <input
                    type="text"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    placeholder="e.g., Civil Lines, Katra"
                    className="w-full border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white dark:bg-zinc-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                    Ratings
                  </label>
                  <div className="space-y-3">
                    {[
                      { key: "safety", label: "Safety", icon: Shield },
                      { key: "connectivity", label: "Connectivity", icon: Zap },
                      { key: "amenities", label: "Amenities", icon: Home },
                      { key: "cleanliness", label: "Cleanliness", icon: TrendingUp },
                    ].map(({ key, label, icon: Icon }) => (
                      <div key={key} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-zinc-500" />
                          <span className="text-sm text-zinc-700 dark:text-zinc-300">{label}</span>
                        </div>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setRatings({ ...ratings, [key]: star })}
                              className="p-1"
                            >
                              <Star
                                className={`w-5 h-5 ${
                                  star <= ratings[key as keyof typeof ratings]
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-zinc-300 dark:text-zinc-600"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Your Review
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience living in this locality..."
                    rows={4}
                    className="w-full border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white dark:bg-zinc-800 dark:text-white resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowReviewModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitReview}
                    disabled={submitting}
                    isLoading={submitting}
                    className="flex-1"
                  >
                    Submit Review
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question Modal */}
      <AnimatePresence>
        {showQuestionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowQuestionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-lg w-full border border-zinc-200 dark:border-zinc-800"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                  Ask a Question
                </h2>
                <button
                  onClick={() => setShowQuestionModal(false)}
                  className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Locality Name
                  </label>
                  <input
                    type="text"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    placeholder="e.g., Civil Lines, Katra"
                    className="w-full border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white dark:bg-zinc-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Your Question
                  </label>
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask about safety, transport, amenities, etc..."
                    rows={4}
                    className="w-full border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white dark:bg-zinc-800 dark:text-white resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowQuestionModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitQuestion}
                    disabled={submitting}
                    isLoading={submitting}
                    className="flex-1"
                  >
                    Post Question
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Answer Modal */}
      <AnimatePresence>
        {showAnswerModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAnswerModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-lg w-full border border-zinc-200 dark:border-zinc-800"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                  Write an Answer
                </h2>
                <button
                  onClick={() => setShowAnswerModal(false)}
                  className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Your Answer
                  </label>
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Share your knowledge about this locality..."
                    rows={5}
                    className="w-full border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white dark:bg-zinc-800 dark:text-white resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowAnswerModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={submitting}
                    isLoading={submitting}
                    className="flex-1"
                  >
                    Post Answer
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
